
"""
AI assessment generation + auto-scoring.

STRUCTURE (per spec):
  Section A — 25 MCQs        @ 2 marks each  = 50 marks
  Section B — 5 Fill-blanks  @ 1 mark each   =  5 marks
  Section C — 5 Coding       @ 9 marks each  = 45 marks
  ------------------------------------------------------
  Total = 35 questions, 100 marks

DESIGN — still no LLM call (matches this project's "runs entirely
locally, no external API keys" positioning). MCQs/fill-blanks are drawn
from a curated per-skill bank with generic padding so we can always hit
exact quotas even for jobs with very few tagged skills. Coding questions
come from a separate algorithm bank tagged to whichever *codeable*
language the job actually requires.

CODING EXECUTION: coding questions are now actually executed server-side
(see ..ai.code_executor and the /assessments router's /code/run and
/submit endpoints) rather than stubbed. Each CODING_BANK entry carries
input_pattern/output_pattern — internal metadata telling code_executor
how to wire stdin into the candidate's `solve(...)` and format its
return value back to stdout. This metadata is stored on the persisted
question (grading needs it later) but is NOT sent to candidates (see
assessments_router.get_assessment_questions).

TEST CASE COUNTS: each CODING_BANK entry ships 3 visible_test_cases
(shown to the candidate, run via /code/run) and 10 hidden_test_cases
(never sent to the frontend, run only at submit time for grading —
see score_coding_question, which awards partial credit proportional
to hidden cases passed).
"""
import random
import re
import uuid
from typing import Dict, List, Optional

MCQ_MARKS = 2.0
FILL_BLANK_MARKS = 1.0
CODING_MARKS = 9.0

MCQ_COUNT = 25
FILL_BLANK_COUNT = 5
CODING_COUNT = 5

CODEABLE_LANGUAGES = ["python", "javascript", "java", "cpp"]

SKILL_BANK: Dict[str, Dict[str, List[Dict]]] = {
    "python": {
        "mcq": [
            {"question": "Which data type in Python is mutable?", "options": ["Tuple", "String", "List", "Frozenset"], "correct_answer": "List", "difficulty": "easy"},
            {"question": "What does the `self` keyword refer to in a Python instance method?", "options": ["The class itself", "The instance of the class", "A global variable", "The parent class"], "correct_answer": "The instance of the class", "difficulty": "medium"},
            {"question": "What is the average-case time complexity of appending to a Python list?", "options": ["O(n)", "O(log n)", "O(1) amortized", "O(n^2)"], "correct_answer": "O(1) amortized", "difficulty": "hard"},
        ],
        "fill_blank": [
            {"question": "The Python keyword used to define a function is ______.", "expected_answer": "def", "accepted_answers": ["def"]},
        ],
    },
    "java": {
        "mcq": [
            {"question": "Which keyword is used to inherit a class in Java?", "options": ["implements", "extends", "inherits", "super"], "correct_answer": "extends", "difficulty": "easy"},
            {"question": "Which of these is NOT a Java access modifier?", "options": ["public", "private", "protected", "internal"], "correct_answer": "internal", "difficulty": "medium"},
            {"question": "What is the default value of an uninitialized int field in Java?", "options": ["null", "0", "undefined", "-1"], "correct_answer": "0", "difficulty": "easy"},
        ],
        "fill_blank": [
            {"question": "The Java keyword used to prevent a class from being subclassed is ______.", "expected_answer": "final", "accepted_answers": ["final"]},
        ],
    },
    "javascript": {
        "mcq": [
            {"question": "Which method converts a JSON string into a JavaScript object?", "options": ["JSON.stringify", "JSON.parse", "JSON.toObject", "Object.parse"], "correct_answer": "JSON.parse", "difficulty": "easy"},
            {"question": "What does `===` check in JavaScript?", "options": ["Value only", "Type only", "Value and type", "Reference only"], "correct_answer": "Value and type", "difficulty": "medium"},
            {"question": "Which of these creates a new Promise in JavaScript?", "options": ["new Promise()", "Promise.create()", "async Promise()", "Promise.new()"], "correct_answer": "new Promise()", "difficulty": "medium"},
        ],
        "fill_blank": [
            {"question": "The JavaScript array method that adds an element to the end of an array is ______.", "expected_answer": "push", "accepted_answers": ["push", ".push", ".push()"]},
        ],
    },
    "react": {
        "mcq": [
            {"question": "Which hook is used to manage state in a functional React component?", "options": ["useEffect", "useState", "useRef", "useMemo"], "correct_answer": "useState", "difficulty": "easy"},
            {"question": "Why does React ask for a `key` prop when rendering a list?", "options": ["For styling", "To help React identify which items changed", "To set z-index", "It's optional and unused"], "correct_answer": "To help React identify which items changed", "difficulty": "medium"},
            {"question": "Which lifecycle behavior does `useEffect` with an empty dependency array mimic?", "options": ["componentDidUpdate", "componentWillUnmount", "componentDidMount", "shouldComponentUpdate"], "correct_answer": "componentDidMount", "difficulty": "medium"},
        ],
        "fill_blank": [
            {"question": "The React hook used to memoize a computed value is ______.", "expected_answer": "useMemo", "accepted_answers": ["useMemo", "usememo"]},
        ],
    },
    "sql": {
        "mcq": [
            {"question": "Which SQL clause is used to filter grouped results?", "options": ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], "correct_answer": "HAVING", "difficulty": "medium"},
            {"question": "Which SQL keyword removes duplicate rows from a result set?", "options": ["UNIQUE", "DISTINCT", "REMOVE", "FILTER"], "correct_answer": "DISTINCT", "difficulty": "easy"},
            {"question": "Which join returns only rows with matches in both tables?", "options": ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"], "correct_answer": "INNER JOIN", "difficulty": "easy"},
        ],
        "fill_blank": [
            {"question": "The SQL clause used to sort query results is ______.", "expected_answer": "ORDER BY", "accepted_answers": ["order by", "orderby"]},
        ],
    },
    "postgresql": {
        "mcq": [
            {"question": "Which PostgreSQL feature speeds up lookups on a column?", "options": ["Trigger", "Index", "View", "Sequence"], "correct_answer": "Index", "difficulty": "easy"},
            {"question": "Which PostgreSQL data type stores structured JSON with indexing support?", "options": ["TEXT", "JSON", "JSONB", "BYTEA"], "correct_answer": "JSONB", "difficulty": "medium"},
        ],
        "fill_blank": [
            {"question": "The PostgreSQL command used to permanently save a transaction is ______.", "expected_answer": "COMMIT", "accepted_answers": ["commit"]},
        ],
    },
    "docker": {
        "mcq": [
            {"question": "Which file defines how a Docker image is built?", "options": ["docker-compose.yml", "Dockerfile", "manifest.json", "image.config"], "correct_answer": "Dockerfile", "difficulty": "easy"},
            {"question": "Which command lists all currently running Docker containers?", "options": ["docker ps", "docker ls", "docker list", "docker containers"], "correct_answer": "docker ps", "difficulty": "easy"},
        ],
        "fill_blank": [
            {"question": "The Docker command used to build an image from a Dockerfile is `docker ______`.", "expected_answer": "build", "accepted_answers": ["build"]},
        ],
    },
    "machine learning": {
        "mcq": [
            {"question": "Which technique helps reduce overfitting in a model?", "options": ["Increasing model complexity", "Regularization", "Removing validation data", "Reducing training data"], "correct_answer": "Regularization", "difficulty": "medium"},
            {"question": "What does a confusion matrix primarily evaluate?", "options": ["Training speed", "Classification performance", "Model size", "Feature count"], "correct_answer": "Classification performance", "difficulty": "medium"},
        ],
        "fill_blank": [
            {"question": "The process of adjusting model hyperparameters to improve performance is called ______.", "expected_answer": "tuning", "accepted_answers": ["tuning", "hyperparameter tuning"]},
        ],
    },
    "data structures": {
        "mcq": [
            {"question": "Which data structure uses LIFO (Last In, First Out) ordering?", "options": ["Queue", "Stack", "Linked List", "Heap"], "correct_answer": "Stack", "difficulty": "easy"},
            {"question": "What is the time complexity of searching a balanced binary search tree?", "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "correct_answer": "O(log n)", "difficulty": "medium"},
        ],
        "fill_blank": [
            {"question": "A data structure that follows FIFO (First In, First Out) ordering is called a ______.", "expected_answer": "queue", "accepted_answers": ["queue"]},
        ],
    },
    "git": {
        "mcq": [
            {"question": "Which command creates a new branch and switches to it in one step?", "options": ["git branch -new", "git checkout -b", "git switch --create", "git new-branch"], "correct_answer": "git checkout -b", "difficulty": "easy"},
            {"question": "Which command stages all changes for the next commit?", "options": ["git commit -a", "git add .", "git stage --all", "git push"], "correct_answer": "git add .", "difficulty": "easy"},
        ],
        "fill_blank": [
            {"question": "The Git command used to combine changes from one branch into another is `git ______`.", "expected_answer": "merge", "accepted_answers": ["merge"]},
        ],
    },
    "oop": {
        "mcq": [
            {"question": "Which OOP principle allows a subclass to provide a specific implementation of a method already defined in its parent?", "options": ["Encapsulation", "Abstraction", "Polymorphism", "Overriding"], "correct_answer": "Overriding", "difficulty": "medium"},
            {"question": "Which OOP principle restricts direct access to an object's internal state?", "options": ["Inheritance", "Encapsulation", "Polymorphism", "Composition"], "correct_answer": "Encapsulation", "difficulty": "easy"},
        ],
        "fill_blank": [
            {"question": "The OOP principle where a class acquires properties of another class is called ______.", "expected_answer": "inheritance", "accepted_answers": ["inheritance"]},
        ],
    },
    "spring boot": {
        "mcq": [
            {"question": "Which annotation marks a class as a Spring Boot REST controller?", "options": ["@Service", "@RestController", "@Repository", "@Configuration"], "correct_answer": "@RestController", "difficulty": "easy"},
            {"question": "Which annotation is used to inject a dependency in Spring Boot?", "options": ["@Inject", "@Autowired", "@Bean", "@Component"], "correct_answer": "@Autowired", "difficulty": "medium"},
        ],
        "fill_blank": [
            {"question": "The Spring Boot annotation used to mark the main application entry point is @Spring______Application.", "expected_answer": "Boot", "accepted_answers": ["boot", "Boot"]},
        ],
    },
    "node.js": {
        "mcq": [
            {"question": "Which built-in Node.js module is used to work with the file system?", "options": ["http", "fs", "path", "os"], "correct_answer": "fs", "difficulty": "easy"},
            {"question": "Which keyword makes a function's variables available to other files in Node.js?", "options": ["export", "public", "share", "global"], "correct_answer": "export", "difficulty": "medium"},
        ],
        "fill_blank": [
            {"question": "The Node.js package manager used to install dependencies is called ______.", "expected_answer": "npm", "accepted_answers": ["npm"]},
        ],
    },
    "html": {
        "mcq": [
            {"question": "Which HTML tag is used to define an internal stylesheet?", "options": ["<css>", "<style>", "<script>", "<link>"], "correct_answer": "<style>", "difficulty": "easy"},
            {"question": "Which attribute makes an HTML input field mandatory?", "options": ["mandatory", "required", "validate", "must"], "correct_answer": "required", "difficulty": "easy"},
        ],
        "fill_blank": [
            {"question": "The HTML tag used to create a hyperlink is `<______>`.", "expected_answer": "a", "accepted_answers": ["a"]},
        ],
    },
    "css": {
        "mcq": [
            {"question": "Which CSS property controls the space between an element's content and its border?", "options": ["margin", "padding", "spacing", "border-gap"], "correct_answer": "padding", "difficulty": "easy"},
            {"question": "Which CSS display value removes an element from the normal document flow and positions it via top/left/right/bottom?", "options": ["static", "relative", "absolute", "inline"], "correct_answer": "absolute", "difficulty": "medium"},
        ],
        "fill_blank": [
            {"question": "The CSS layout model based on rows and columns is called ______.", "expected_answer": "grid", "accepted_answers": ["grid", "css grid"]},
        ],
    },
    "system design": {
        "mcq": [
            {"question": "What is the primary purpose of a load balancer in system design?", "options": ["Encrypt traffic", "Distribute traffic across servers", "Store data permanently", "Compile code"], "correct_answer": "Distribute traffic across servers", "difficulty": "medium"},
        ],
        "fill_blank": [
            {"question": "A temporary storage layer used to speed up repeated data access is called a ______.", "expected_answer": "cache", "accepted_answers": ["cache"]},
        ],
    },
}

GENERIC_MCQ_POOL = [
    {"question": "What does 'REST' stand for in RESTful APIs?", "options": ["Remote State Transfer", "Representational State Transfer", "Reliable Service Transfer", "Recursive State Transfer"], "correct_answer": "Representational State Transfer", "difficulty": "medium", "skill_tag": "general"},
    {"question": "Which HTTP status code indicates a successful resource creation?", "options": ["200", "201", "301", "404"], "correct_answer": "201", "difficulty": "easy", "skill_tag": "general"},
    {"question": "Which HTTP method is idempotent and used to update a resource fully?", "options": ["POST", "PUT", "PATCH", "GET"], "correct_answer": "PUT", "difficulty": "medium", "skill_tag": "general"},
    {"question": "What does 'CI/CD' primarily automate in software delivery?", "options": ["UI design", "Build, test, and deployment pipelines", "Database backups", "Password resets"], "correct_answer": "Build, test, and deployment pipelines", "difficulty": "easy", "skill_tag": "general"},
    {"question": "Which of these best describes 'idempotency' in an API operation?", "options": ["It always fails the second time", "Calling it multiple times has the same effect as once", "It requires authentication", "It only works with GET"], "correct_answer": "Calling it multiple times has the same effect as once", "difficulty": "hard", "skill_tag": "general"},
    {"question": "What is the primary benefit of version control systems like Git?", "options": ["Faster compilation", "Tracking and merging changes to code over time", "Automatic testing", "Server hosting"], "correct_answer": "Tracking and merging changes to code over time", "difficulty": "easy", "skill_tag": "general"},
    {"question": "In agile methodology, what is a 'sprint'?", "options": ["A code refactor", "A fixed, short iteration of work", "A production incident", "A database migration"], "correct_answer": "A fixed, short iteration of work", "difficulty": "easy", "skill_tag": "general"},
    {"question": "What does 'DRY' stand for in software engineering principles?", "options": ["Don't Repeat Yourself", "Do Read Yearly", "Data Recovery Yield", "Dynamic Runtime Yield"], "correct_answer": "Don't Repeat Yourself", "difficulty": "easy", "skill_tag": "general"},
    {"question": "Which testing level verifies that individual functions/units work correctly in isolation?", "options": ["Integration testing", "Unit testing", "Load testing", "Acceptance testing"], "correct_answer": "Unit testing", "difficulty": "easy", "skill_tag": "general"},
    {"question": "What is the main purpose of an environment variable in application configuration?", "options": ["Store UI themes", "Externalize config without hardcoding it in source", "Speed up compilation", "Manage user sessions"], "correct_answer": "Externalize config without hardcoding it in source", "difficulty": "medium", "skill_tag": "general"},
]

GENERIC_FILL_BLANK_POOL = [
    {"question": "The HTTP status code range 4xx generally indicates a ______ error.", "expected_answer": "client", "accepted_answers": ["client", "client-side", "client side"], "skill_tag": "general"},
    {"question": "The practice of writing tests before writing implementation code is called ______ development.", "expected_answer": "test-driven", "accepted_answers": ["test-driven", "test driven", "tdd"], "skill_tag": "general"},
    {"question": "A function that calls itself to solve a smaller instance of the same problem is called ______.", "expected_answer": "recursion", "accepted_answers": ["recursion", "recursive"], "skill_tag": "general"},
    {"question": "The architectural style where an application is split into small, independently deployable services is called ______ architecture.", "expected_answer": "microservices", "accepted_answers": ["microservices", "microservice"], "skill_tag": "general"},
    {"question": "The process of converting source code into machine-readable instructions ahead of execution is called ______.", "expected_answer": "compilation", "accepted_answers": ["compilation", "compiling"], "skill_tag": "general"},
]

CODING_BANK = [
    {
        "title": "Sum of a List",
        "difficulty": "easy",
        "input_pattern": "count_then_list",
        "output_pattern": "int",
        "problem_statement": "You are given a list of n integers. Write a function `solve(nums)` that returns the sum of all the integers in the list.\n\nThis is a warm-up problem — no special algorithm is required. Iterate through the list once and accumulate a running total. The list may contain negative numbers, so don't assume the sum is always positive.",
        "input_format": "First line: n (count). Second line: n space-separated integers.",
        "output_format": "A single integer — the sum of the input numbers.",
        "constraints": "1 <= n <= 1000, -10^6 <= each integer <= 10^6",
        "examples": [
            {"input": "5\n1 2 3 4 5", "output": "15", "explanation": "There are 5 numbers: 1, 2, 3, 4, and 5. Their sum is 1+2+3+4+5 = 15."},
            {"input": "3\n-4 10 -2", "output": "4", "explanation": "Negative numbers are added normally: -4 + 10 + (-2) = 4."},
        ],
        "starter_code": {
            "python": "def solve(nums):\n    # nums: List[int]\n    pass\n",
            "javascript": "function solve(nums) {\n  // nums: number[]\n}\n",
            "java": "import java.util.*;\n\npublic class Solution {\n    public static int solve(int[] nums) {\n        // Write your solution here\n    }\n}\n",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nint solve(vector<int>& nums) {\n    // Write your solution here\n}\n"
        },
        "visible_test_cases": [
            {"input": "5\n1 2 3 4 5", "output": "15"},
            {"input": "3\n10 20 30", "output": "60"},
            {"input": "4\n1 1 1 1", "output": "4"},
        ],
        "hidden_test_cases": [
            {"input": "1\n0", "output": "0"},
            {"input": "4\n-1 -2 -3 -4", "output": "-10"},
            {"input": "2\n100 200", "output": "300"},
            {"input": "6\n1 2 3 4 5 6", "output": "21"},
            {"input": "3\n-5 5 10", "output": "10"},
            {"input": "5\n0 0 0 0 0", "output": "0"},
            {"input": "4\n1000000 -1000000 500 -500", "output": "0"},
            {"input": "7\n1 2 3 4 5 6 7", "output": "28"},
            {"input": "2\n-10 -20", "output": "-30"},
            {"input": "5\n2 4 6 8 10", "output": "30"},
        ],
    },
    {
        "title": "Reverse a String",
        "difficulty": "easy",
        "input_pattern": "single_string",
        "output_pattern": "string",
        "problem_statement": "Write a function `solve(s)` that takes a single string `s` and returns a new string containing the same characters in reverse order.\n\nFor example, reversing \"cat\" gives \"tac\". You can use a built-in reverse utility if your language has one, or reverse it manually with a loop — either approach is accepted, as long as the returned string is correct. The input may contain letters, digits, or a mix of both, of any length up to the limit below.",
        "input_format": "A single line string s.",
        "output_format": "The reversed string.",
        "constraints": "1 <= s.length <= 1000",
        "examples": [
            {"input": "hello", "output": "olleh", "explanation": "Reading \"hello\" backwards gives \"olleh\"."},
            {"input": "ab12", "output": "21ba", "explanation": "Reversal applies to every character, including digits, not just letters."},
        ],
        "starter_code": {
            "python": "def solve(s):\n    pass\n",
            "javascript": "function solve(s) {\n}\n",
            "java": "import java.util.*;\n\npublic class Solution {\n    public static String solve(String s) {\n    }\n}\n",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nstring solve(string s) {\n}\n"
        },
        "visible_test_cases": [
            {"input": "hello", "output": "olleh"},
            {"input": "java", "output": "avaj"},
            {"input": "abc", "output": "cba"},
        ],
        "hidden_test_cases": [
            {"input": "a", "output": "a"},
            {"input": "racecar", "output": "racecar"},
            {"input": "abcdef", "output": "fedcba"},
            {"input": "z", "output": "z"},
            {"input": "Hello", "output": "olleH"},
            {"input": "12345", "output": "54321"},
            {"input": "ab", "output": "ba"},
            {"input": "programming", "output": "gnimmargorp"},
            {"input": "x", "output": "x"},
            {"input": "openai", "output": "ianepo"},
        ],
    },
    {
        "title": "FizzBuzz",
        "difficulty": "easy",
        "input_pattern": "single_int",
        "output_pattern": "string_lines",
        "problem_statement": "Write a function `solve(n)` that returns the FizzBuzz sequence from 1 to n as a list of strings, one entry per number in order.\n\nFor each number i from 1 to n:\n- If i is divisible by both 3 and 5, the entry is \"FizzBuzz\".\n- Else if i is divisible by 3 only, the entry is \"Fizz\".\n- Else if i is divisible by 5 only, the entry is \"Buzz\".\n- Otherwise, the entry is the number itself, as a string (e.g. \"7\").\n\nCheck the \"divisible by both\" case first (or check divisibility by 15 directly) — otherwise a multiple of both 3 and 5 will incorrectly come out as just \"Fizz\" or just \"Buzz\".",
        "input_format": "A single integer n.",
        "output_format": "n lines, one value per line.",
        "constraints": "1 <= n <= 1000",
        "examples": [
            {"input": "5", "output": "1\n2\nFizz\n4\nBuzz", "explanation": "3 is divisible by 3, so it becomes \"Fizz\". 5 is divisible by 5, so it becomes \"Buzz\". 1, 2, and 4 are printed as plain numbers."},
            {"input": "15", "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", "explanation": "15 is divisible by both 3 and 5, so it becomes \"FizzBuzz\" instead of just \"Fizz\" or \"Buzz\"."},
        ],
        "starter_code": {
            "python": "def solve(n):\n    # return a list of strings, one per line\n    pass\n",
            "javascript": "function solve(n) {\n  // return an array of strings, one per line\n}\n",
            "java": "import java.util.*;\n\npublic class Solution {\n    public static List<String> solve(int n) {\n    }\n}\n",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nvector<string> solve(int n) {\n}\n"
        },
        "visible_test_cases": [
            {"input": "5", "output": "1\n2\nFizz\n4\nBuzz"},
            {"input": "3", "output": "1\n2\nFizz"},
            {"input": "1", "output": "1"},
        ],
        "hidden_test_cases": [
            {"input": "1", "output": "1"},
            {"input": "2", "output": "1\n2"},
            {"input": "4", "output": "1\n2\nFizz\n4"},
            {"input": "6", "output": "1\n2\nFizz\n4\nBuzz\nFizz"},
            {"input": "8", "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8"},
            {"input": "9", "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz"},
            {"input": "10", "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz"},
            {"input": "12", "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz"},
            {"input": "15", "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz"},
            {"input": "20", "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz"},
        ],
    },
    {
        "title": "Check Palindrome",
        "difficulty": "medium",
        "input_pattern": "single_string",
        "output_pattern": "bool_lower",
        "problem_statement": "Write a function `solve(s)` that checks whether the string `s` reads the same forwards and backwards (a palindrome), and returns true or false.\n\nThe input contains only lowercase letters (no spaces or punctuation), so you don't need to worry about case or stripping non-letter characters — just compare the string against its own reverse.",
        "input_format": "A single line string s (lowercase letters only).",
        "output_format": "\"true\" if s is a palindrome, otherwise \"false\".",
        "constraints": "1 <= s.length <= 1000",
        "examples": [
            {"input": "level", "output": "true", "explanation": "\"level\" reversed is still \"level\", so it reads the same both ways."},
            {"input": "hello", "output": "false", "explanation": "\"hello\" reversed is \"olleh\", which is not the same as \"hello\"."},
        ],
        "starter_code": {
            "python": "def solve(s):\n    pass\n",
            "javascript": "function solve(s) {\n}\n",
            "java": "import java.util.*;\n\npublic class Solution {\n    public static boolean solve(String s) {\n    }\n}\n",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nbool solve(string s) {\n}\n"
        },
        "visible_test_cases": [
            {"input": "level", "output": "true"},
            {"input": "hello", "output": "false"},
            {"input": "noon", "output": "true"},
        ],
        "hidden_test_cases": [
            {"input": "a", "output": "true"},
            {"input": "ab", "output": "false"},
            {"input": "aba", "output": "true"},
            {"input": "abba", "output": "true"},
            {"input": "abcda", "output": "false"},
            {"input": "racecar", "output": "true"},
            {"input": "xyx", "output": "true"},
            {"input": "xyz", "output": "false"},
            {"input": "madam", "output": "true"},
            {"input": "hello", "output": "false"},
        ],
    },
    {
        "title": "Factorial",
        "difficulty": "medium",
        "input_pattern": "single_int",
        "output_pattern": "int",
        "problem_statement": "Write a function `solve(n)` that computes n! (n factorial): the product of all positive integers from 1 up to n.\n\nBy convention, 0! = 1. For example, 4! = 4 × 3 × 2 × 1 = 24. A loop that multiplies a running total by each integer from 2 up to n is enough — recursion works too if you prefer it.",
        "input_format": "A single integer n.",
        "output_format": "A single integer — n factorial.",
        "constraints": "0 <= n <= 20",
        "examples": [
            {"input": "5", "output": "120", "explanation": "5! = 5 × 4 × 3 × 2 × 1 = 120."},
            {"input": "0", "output": "1", "explanation": "0! is defined to be 1 by convention — don't return 0 for this case."},
        ],
        "starter_code": {
            "python": "def solve(n):\n    pass\n",
            "javascript": "function solve(n) {\n}\n",
            "java": "import java.util.*;\n\npublic class Solution {\n    public static long solve(int n) {\n    }\n}\n",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nlong long solve(int n) {\n}\n"
        },
        "visible_test_cases": [
            {"input": "5", "output": "120"},
            {"input": "0", "output": "1"},
            {"input": "3", "output": "6"},
        ],
        "hidden_test_cases": [
            # Capped at 13! so results stay within JS's safe-integer range
            # (Number.MAX_SAFE_INTEGER) -- 20! overflows a JS double's exact
            # precision even though the constraint allows n up to 20, which
            # would make the JS-submission path fail a case Python/Java/C++
            # would pass. Keeping test data cross-language-fair on purpose.
            {"input": "1", "output": "1"},
            {"input": "2", "output": "2"},
            {"input": "4", "output": "24"},
            {"input": "6", "output": "720"},
            {"input": "7", "output": "5040"},
            {"input": "8", "output": "40320"},
            {"input": "9", "output": "362880"},
            {"input": "10", "output": "3628800"},
            {"input": "11", "output": "39916800"},
            {"input": "13", "output": "6227020800"},
        ],
    },
    {
        "title": "Check Prime",
        "difficulty": "medium",
        "input_pattern": "single_int",
        "output_pattern": "bool_lower",
        "problem_statement": "Write a function `solve(n)` that determines whether the positive integer `n` is prime, returning true or false.\n\nA number is prime if it is greater than 1 and has no divisors other than 1 and itself. Checking for a divisor from 2 up to the square root of n is enough to answer efficiently, even for n close to the upper constraint. Remember that 1 is not considered prime.",
        "input_format": "A single integer n.",
        "output_format": "\"true\" if n is prime, otherwise \"false\".",
        "constraints": "1 <= n <= 10^6",
        "examples": [
            {"input": "7", "output": "true", "explanation": "7 has no divisors other than 1 and 7 itself, so it is prime."},
            {"input": "8", "output": "false", "explanation": "8 = 2 × 4, so it has a divisor other than 1 and itself, meaning it is not prime."},
        ],
        "starter_code": {
            "python": "def solve(n):\n    pass\n",
            "javascript": "function solve(n) {\n}\n",
            "java": "import java.util.*;\n\npublic class Solution {\n    public static boolean solve(int n) {\n    }\n}\n",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nbool solve(int n) {\n}\n"
        },
        "visible_test_cases": [
            {"input": "7", "output": "true"},
            {"input": "8", "output": "false"},
            {"input": "2", "output": "true"},
        ],
        "hidden_test_cases": [
            {"input": "1", "output": "false"},
            {"input": "97", "output": "true"},
            {"input": "100", "output": "false"},
            {"input": "13", "output": "true"},
            {"input": "15", "output": "false"},
            {"input": "29", "output": "true"},
            {"input": "49", "output": "false"},
            {"input": "991", "output": "true"},
            {"input": "1000000", "output": "false"},
            {"input": "999983", "output": "true"},
        ],
    },
    {
        "title": "Two Sum",
        "difficulty": "hard",
        "input_pattern": "list_then_target",
        "output_pattern": "int_pair",
        "problem_statement": "You are given a list of integers `nums` and an integer `target`. Write a function `solve(nums, target)` that finds two different elements whose values add up exactly to `target`, and returns their 0-based indices.\n\nExactly one valid pair is guaranteed to exist, so you don't need to handle zero or multiple answers. The same element can't be used twice — the two indices must be different, even if the list has duplicate values. Return the earlier index first.",
        "input_format": "First line: n space-separated integers. Second line: target integer.",
        "output_format": "Two space-separated indices.",
        "constraints": "2 <= n <= 1000, exactly one valid pair exists",
        "examples": [
            {"input": "2 7 11 15\n9", "output": "0 1", "explanation": "nums[0] + nums[1] = 2 + 7 = 9, which matches the target."},
            {"input": "3 2 4\n6", "output": "1 2", "explanation": "nums[1] + nums[2] = 2 + 4 = 6. Note nums[0] + nums[1] = 3 + 2 = 5 does not match the target, so index 0 is not part of the answer."},
        ],
        "starter_code": {
            "python": "def solve(nums, target):\n    # return (i, j)\n    pass\n",
            "javascript": "function solve(nums, target) {\n  // return [i, j]\n}\n",
            "java": "import java.util.*;\n\npublic class Solution {\n    public static int[] solve(int[] nums, int target) {\n    }\n}\n",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> solve(vector<int>& nums, int target) {\n}\n"
        },
        "visible_test_cases": [
            {"input": "2 7 11 15\n9", "output": "0 1"},
            {"input": "3 2 4\n6", "output": "1 2"},
            {"input": "1 2 3\n5", "output": "1 2"},
        ],
        "hidden_test_cases": [
            {"input": "3 3\n6", "output": "0 1"},
            {"input": "1 5 3 8\n11", "output": "2 3"},
            {"input": "0 4 3 0\n0", "output": "0 3"},
            {"input": "-3 4 3 90\n0", "output": "0 2"},
            {"input": "5 75 25\n100", "output": "1 2"},
            {"input": "1 2 3 4 5\n9", "output": "3 4"},
            {"input": "10 20 30 40 50\n90", "output": "3 4"},
            {"input": "2 5 5 11\n10", "output": "1 2"},
            {"input": "-1 -2 -3 -4 -5\n-8", "output": "2 4"},
            {"input": "12 3 7 1\n10", "output": "1 2"},
        ],
    },
    {
        "title": "Binary Search",
        "difficulty": "hard",
        "input_pattern": "list_then_target",
        "output_pattern": "int",
        "problem_statement": "You are given a list of integers `nums`, sorted in ascending order, and an integer `target`. Write a function `solve(nums, target)` that returns the index of `target` using binary search, or -1 if it isn't present.\n\nBecause the list is already sorted, repeatedly compare `target` against the middle element of the current search range and eliminate half the remaining elements each time, rather than scanning from the start — that's the point of the exercise, and it's what makes binary search fast on large lists.",
        "input_format": "First line: sorted space-separated integers. Second line: target integer.",
        "output_format": "A single integer — the index of target, or -1.",
        "constraints": "1 <= n <= 10^5, array is sorted ascending",
        "examples": [
            {"input": "1 3 5 7 9 11\n7", "output": "3", "explanation": "nums[3] = 7, which matches the target, so index 3 is returned."},
            {"input": "1 3 5 7 9 11\n4", "output": "-1", "explanation": "4 does not appear anywhere in the list, so the function returns -1."},
        ],
        "starter_code": {
            "python": "def solve(nums, target):\n    pass\n",
            "javascript": "function solve(nums, target) {\n}\n",
            "java": "import java.util.*;\n\npublic class Solution {\n    public static int solve(int[] nums, int target) {\n    }\n}\n",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nint solve(vector<int>& nums, int target) {\n}\n"
        },
        "visible_test_cases": [
            {"input": "1 3 5 7 9 11\n7", "output": "3"},
            {"input": "1 3 5 7 9 11\n4", "output": "-1"},
            {"input": "1 2 3 4 5\n1", "output": "0"},
        ],
        "hidden_test_cases": [
            # Note: no duplicate-value arrays here on purpose -- with repeated
            # values, more than one index is a legitimately correct binary
            # search result, and this grader does an exact-string compare
            # against one expected index, so a duplicate-value case would
            # unfairly fail a correct solution that lands on a different
            # (also valid) index.
            {"input": "5\n5", "output": "0"},
            {"input": "1 2 3 4 5 6 7 8 9 10\n10", "output": "9"},
            {"input": "2 4 6 8 10\n2", "output": "0"},
            {"input": "2 4 6 8 10\n10", "output": "4"},
            {"input": "2 4 6 8 10\n5", "output": "-1"},
            {"input": "1 3 5 7 9\n9", "output": "4"},
            {"input": "1 3 5 7 9\n1", "output": "0"},
            {"input": "-10 -5 0 5 10\n0", "output": "2"},
            {"input": "-10 -5 0 5 10\n-10", "output": "0"},
            {"input": "100\n100", "output": "0"},
        ],
    },
]

DIFFICULTY_ORDER = {"easy": 0, "medium": 1, "hard": 2}


def _dedupe_by_question_text(items):
    seen = set()
    out = []
    for item in items:
        norm = re.sub(r"\s+", " ", item["question"].strip().lower())
        if norm in seen:
            continue
        seen.add(norm)
        out.append(item)
    return out


def _pick_round_robin(skills, question_type, count):
    picked = []
    skills_cycle = [s.lower().strip() for s in skills if s.lower().strip() in SKILL_BANK]

    # Shuffle a private copy of each skill's bank per call. Without this,
    # this function always walked SKILL_BANK[skill][question_type] from
    # index 0 in the same fixed order, so two assessments generated for
    # the same skill set picked the exact same items in the exact same
    # order every time.
    shuffled_banks = {}
    for skill in skills_cycle:
        bank = list(SKILL_BANK.get(skill, {}).get(question_type, []))
        random.shuffle(bank)
        shuffled_banks[skill] = bank
    skill_cursors = {s: 0 for s in skills_cycle}

    if skills_cycle:
        exhausted = set()
        while len(picked) < count and len(exhausted) < len(skills_cycle):
            for skill in skills_cycle:
                if len(picked) >= count:
                    break
                bank = shuffled_banks.get(skill, [])
                idx = skill_cursors.get(skill, 0)
                if idx >= len(bank):
                    exhausted.add(skill)
                    continue
                item = dict(bank[idx])
                item["skill_tag"] = skill
                picked.append(item)
                skill_cursors[skill] = idx + 1

    return picked


def _pad_with_generic(picked, pool, count, full_bank_fallback=None):
    picked = _dedupe_by_question_text(picked)

    def _seen_texts():
        return {re.sub(r"\s+", " ", p["question"].strip().lower()) for p in picked}

    if len(picked) < count:
        remaining_pool = [p for p in pool if re.sub(r"\s+", " ", p["question"].strip().lower()) not in _seen_texts()]
        random.shuffle(remaining_pool)
        for item in remaining_pool:
            if len(picked) >= count:
                break
            picked.append(dict(item))

    if len(picked) < count and full_bank_fallback:
        remaining_full = [p for p in full_bank_fallback if re.sub(r"\s+", " ", p["question"].strip().lower()) not in _seen_texts()]
        random.shuffle(remaining_full)
        for item in remaining_full:
            if len(picked) >= count:
                break
            picked.append(dict(item))

    return picked[:count]


def _finalize_mcq(item):
    return {
        "id": uuid.uuid4().hex[:8],
        "type": "mcq",
        "question": item["question"],
        "options": item["options"],
        "correct_answer": item["correct_answer"],
        "marks": MCQ_MARKS,
        "difficulty": item.get("difficulty", "medium"),
        "skill_tag": item.get("skill_tag", "general"),
    }


def _finalize_fill_blank(item):
    return {
        "id": uuid.uuid4().hex[:8],
        "type": "fill_blank",
        "question": item["question"],
        "expected_answer": item["expected_answer"],
        "accepted_answers": item.get("accepted_answers", [item["expected_answer"]]),
        "marks": FILL_BLANK_MARKS,
        "skill_tag": item.get("skill_tag", "general"),
    }


def _finalize_coding(item, skill_tag):
    return {
        "id": uuid.uuid4().hex[:8],
        "type": "coding",
        "question": item["title"],
        "problem_statement": item["problem_statement"],
        "input_format": item["input_format"],
        "output_format": item["output_format"],
        "constraints": item["constraints"],
        "examples": item["examples"],
        "starter_code": item["starter_code"],
        "allowed_languages": list(item["starter_code"].keys()),
        "visible_test_cases": item["visible_test_cases"],
        "hidden_test_cases": item["hidden_test_cases"],
        "time_limit_ms": 2000,
        "memory_limit_mb": 128,
        "marks": CODING_MARKS,
        "difficulty": item.get("difficulty", "medium"),
        "skill_tag": skill_tag,
        "input_pattern": item["input_pattern"],
        "output_pattern": item["output_pattern"],
    }


def _flatten_full_bank(question_type):
    flat = []
    for skill, buckets in SKILL_BANK.items():
        for item in buckets.get(question_type, []):
            d = dict(item)
            d["skill_tag"] = skill
            flat.append(d)
    return flat


def generate_assessment_questions(required_skills, num_questions=None, question_mix=None):
    mix = question_mix or {}
    mcq_count = mix.get("mcq", MCQ_COUNT)
    fill_blank_count = mix.get("fill_blank", FILL_BLANK_COUNT)
    coding_count = mix.get("coding", CODING_COUNT)

    mcq_picked = _pick_round_robin(required_skills, "mcq", mcq_count)
    mcq_picked = _pad_with_generic(mcq_picked, GENERIC_MCQ_POOL, mcq_count, full_bank_fallback=_flatten_full_bank("mcq"))
    mcqs = [_finalize_mcq(item) for item in mcq_picked]

    fb_picked = _pick_round_robin(required_skills, "fill_blank", fill_blank_count)
    fb_picked = _pad_with_generic(fb_picked, GENERIC_FILL_BLANK_POOL, fill_blank_count, full_bank_fallback=_flatten_full_bank("fill_blank"))
    fill_blanks = [_finalize_fill_blank(item) for item in fb_picked]

    coding_skill_tag = next(
        (s.lower().strip() for s in required_skills if s.lower().strip() in CODEABLE_LANGUAGES),
        "algorithms",
    )
    # Randomize WHICH problems are picked -- this used to sort the whole
    # bank by difficulty and always take the first N, which meant every
    # assessment (for any job, any skill set) got the exact same coding
    # questions in the exact same order every time. random.sample picks a
    # genuinely different set of problems on each call; the difficulty
    # sort is applied AFTER selection, purely to present the chosen
    # problems easy-to-hard for a smoother candidate experience -- it no
    # longer determines which problems get chosen in the first place.
    pool_size = min(coding_count, len(CODING_BANK))
    chosen = random.sample(CODING_BANK, pool_size)
    while len(chosen) < coding_count:
        chosen.append(random.choice(CODING_BANK))
    chosen.sort(key=lambda q: DIFFICULTY_ORDER.get(q["difficulty"], 1))
    coding_qs = [_finalize_coding(item, coding_skill_tag) for item in chosen[:coding_count]]

    questions = mcqs + fill_blanks + coding_qs
    validate_assessment(questions, mcq_count, fill_blank_count, coding_count)
    return questions


def validate_assessment(questions, mcq_count, fill_blank_count, coding_count):
    mcqs = [q for q in questions if q["type"] == "mcq"]
    fbs = [q for q in questions if q["type"] == "fill_blank"]
    coding = [q for q in questions if q["type"] == "coding"]

    assert len(mcqs) == mcq_count, f"expected {mcq_count} MCQs, got {len(mcqs)}"
    assert len(fbs) == fill_blank_count, f"expected {fill_blank_count} fill-blanks, got {len(fbs)}"
    assert len(coding) == coding_count, f"expected {coding_count} coding questions, got {len(coding)}"

    texts = [q["question"].strip().lower() for q in questions]
    assert len(texts) == len(set(texts)), "duplicate question text detected"

    for q in mcqs:
        assert len(q.get("options") or []) == 4, f"mcq '{q['question']}' does not have exactly 4 options"
        assert q.get("correct_answer") in (q.get("options") or []), f"mcq '{q['question']}' correct_answer not in options"

    for q in fbs:
        assert q.get("expected_answer"), f"fill_blank '{q['question']}' missing expected_answer"

    for q in coding:
        assert q.get("examples"), f"coding '{q['question']}' missing examples"
        assert q.get("visible_test_cases"), f"coding '{q['question']}' missing visible test cases"
        assert q.get("hidden_test_cases"), f"coding '{q['question']}' missing hidden test cases"
        assert q.get("input_pattern") and q.get("output_pattern"), f"coding '{q['question']}' missing execution metadata"

    total_marks = sum(q.get("marks", 0) for q in questions)
    assert abs(total_marks - 100.0) < 0.01, f"expected total marks 100, got {total_marks}"


def _normalize_answer(raw):
    return re.sub(r"\s+", " ", (raw or "").strip().lower())


def _score_mcq(question, candidate_answer):
    correct = _normalize_answer(candidate_answer) == _normalize_answer(question.get("correct_answer", ""))
    points = question["marks"] if correct else 0.0
    feedback = "Correct." if correct else f"Incorrect — expected: {question.get('correct_answer')}"
    return {"points": points, "feedback": feedback}


def _score_fill_blank(question, candidate_answer):
    accepted = {_normalize_answer(a) for a in (question.get("accepted_answers") or [question.get("expected_answer", "")])}
    correct = _normalize_answer(candidate_answer) in accepted
    points = question["marks"] if correct else 0.0
    feedback = "Correct." if correct else f"Incorrect — expected: {question.get('expected_answer')}"
    return {"points": points, "feedback": feedback}


def score_coding_question(question, test_results):
    marks = question["marks"]
    if test_results is None:
        return {"points": 0.0, "feedback": "Not evaluated — no execution result available.", "passed": 0, "total": len(question.get("hidden_test_cases") or [])}

    total = len(test_results)
    if total == 0:
        return {"points": 0.0, "feedback": "No hidden test cases to evaluate against.", "passed": 0, "total": 0}

    passed = sum(1 for r in test_results if r)
    points = round(marks * (passed / total), 2)
    feedback = f"{passed}/{total} hidden test cases passed."
    return {"points": points, "feedback": feedback, "passed": passed, "total": total}


def score_submission(questions, answers):
    per_question = []
    total_points = 0.0
    max_score = 0.0

    for q in questions:
        qid = q["id"]
        raw_answer = answers.get(qid)
        marks = q.get("marks", 1.0)
        max_score += marks

        if q["type"] == "mcq":
            result = _score_mcq(q, raw_answer if isinstance(raw_answer, str) else "")
        elif q["type"] == "fill_blank":
            result = _score_fill_blank(q, raw_answer if isinstance(raw_answer, str) else "")
        elif q["type"] == "coding":
            submission = raw_answer if isinstance(raw_answer, dict) else {}
            result = score_coding_question(q, submission.get("test_results"))
        else:
            result = {"points": 0.0, "feedback": "Unknown question type."}

        total_points += result["points"]
        per_question.append({
            "question_id": qid,
            "question": q["question"],
            "type": q["type"],
            "points": round(result["points"], 2),
            "max_points": marks,
            "feedback": result["feedback"],
        })

    score_pct = round((total_points / max_score) * 100, 1) if max_score > 0 else 0.0

    section_breakdown = {}
    for f in per_question:
        b = section_breakdown.setdefault(f["type"], {"points": 0.0, "max_points": 0.0})
        b["points"] += f["points"]
        b["max_points"] += f["max_points"]
    for b in section_breakdown.values():
        b["points"] = round(b["points"], 2)
        b["max_points"] = round(b["max_points"], 2)

    return {
        "score_pct": score_pct,
        "max_score": max_score,
        "raw_points": round(total_points, 2),
        "per_question_feedback": per_question,
        "section_breakdown": section_breakdown,
    }
