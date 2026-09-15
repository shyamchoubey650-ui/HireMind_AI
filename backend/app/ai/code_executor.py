

import concurrent.futures
import os
import re
import shutil
import subprocess
import tempfile
import time
import uuid
from typing import Dict, List, Optional

TIMEOUT_SECONDS = 6
COMPILE_TIMEOUT_SECONDS = 15


def _which(cmd: str) -> Optional[str]:
    return shutil.which(cmd)


def toolchain_status() -> Dict[str, bool]:
    return {
        "python": _which("python3") is not None or _which("python") is not None,
        "javascript": _which("node") is not None,
        "cpp": _which("g++") is not None,
        "java": _which("javac") is not None and _which("java") is not None,
    }


_PY_DRIVER = """
import sys
INPUT_PATTERN = {input_pattern!r}
OUTPUT_PATTERN = {output_pattern!r}

_raw = sys.stdin.read()
_lines = _raw.split("\\n")

if INPUT_PATTERN == "count_then_list":
    _nums = list(map(int, _lines[1].split()))
    _result = solve(_nums)
elif INPUT_PATTERN == "single_string":
    _result = solve(_lines[0])
elif INPUT_PATTERN == "single_int":
    _result = solve(int(_lines[0].strip()))
elif INPUT_PATTERN == "list_then_target":
    _nums = list(map(int, _lines[0].split()))
    _target = int(_lines[1].strip())
    _result = solve(_nums, _target)
else:
    raise ValueError("unknown input pattern")

if OUTPUT_PATTERN == "int":
    print(int(_result))
elif OUTPUT_PATTERN == "string":
    print(_result)
elif OUTPUT_PATTERN == "bool_lower":
    print("true" if _result else "false")
elif OUTPUT_PATTERN == "string_lines":
    print("\\n".join(str(x) for x in _result))
elif OUTPUT_PATTERN == "int_pair":
    print(f"{{_result[0]}} {{_result[1]}}")
else:
    raise ValueError("unknown output pattern")
"""

_JS_DRIVER = """
const fs = require('fs');
const INPUT_PATTERN = {input_pattern!r};
const OUTPUT_PATTERN = {output_pattern!r};

const raw = fs.readFileSync(0, 'utf-8');
const lines = raw.split('\\n');
let result;
if (INPUT_PATTERN === "count_then_list") {{
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  result = solve(nums);
}} else if (INPUT_PATTERN === "single_string") {{
  result = solve(lines[0]);
}} else if (INPUT_PATTERN === "single_int") {{
  result = solve(parseInt(lines[0].trim(), 10));
}} else if (INPUT_PATTERN === "list_then_target") {{
  const nums = lines[0].trim().split(/\\s+/).map(Number);
  const target = parseInt(lines[1].trim(), 10);
  result = solve(nums, target);
}} else {{
  throw new Error("unknown input pattern");
}}

if (OUTPUT_PATTERN === "int") console.log(result);
else if (OUTPUT_PATTERN === "string") console.log(result);
else if (OUTPUT_PATTERN === "bool_lower") console.log(result ? "true" : "false");
else if (OUTPUT_PATTERN === "string_lines") console.log(result.join('\\n'));
else if (OUTPUT_PATTERN === "int_pair") console.log(result[0] + ' ' + result[1]);
else throw new Error("unknown output pattern");
"""

_CPP_MAIN = {
    ("count_then_list", "int"): """
int main() {
    int n; std::cin >> n;
    std::vector<int> nums(n);
    for (auto &x : nums) std::cin >> x;
    std::cout << solve(nums) << std::endl;
    return 0;
}
""",
    ("single_string", "string"): """
int main() {
    std::string s;
    std::getline(std::cin, s);
    std::cout << solve(s) << std::endl;
    return 0;
}
""",
    ("single_string", "bool_lower"): """
int main() {
    std::string s;
    std::getline(std::cin, s);
    std::cout << (solve(s) ? "true" : "false") << std::endl;
    return 0;
}
""",
    ("single_int", "string_lines"): """
int main() {
    int n; std::cin >> n;
    auto r = solve(n);
    for (size_t i = 0; i < r.size(); i++) {
        std::cout << r[i];
        if (i + 1 < r.size()) std::cout << "\\n";
    }
    std::cout << std::endl;
    return 0;
}
""",
    ("single_int", "int"): """
int main() {
    int n; std::cin >> n;
    std::cout << solve(n) << std::endl;
    return 0;
}
""",
    ("single_int", "bool_lower"): """
int main() {
    int n; std::cin >> n;
    std::cout << (solve(n) ? "true" : "false") << std::endl;
    return 0;
}
""",
    ("list_then_target", "int_pair"): """
int main() {
    std::string line1;
    std::getline(std::cin, line1);
    std::stringstream ss(line1);
    std::vector<int> nums;
    int x;
    while (ss >> x) nums.push_back(x);
    int target; std::cin >> target;
    auto r = solve(nums, target);
    std::cout << r[0] << " " << r[1] << std::endl;
    return 0;
}
""",
    ("list_then_target", "int"): """
int main() {
    std::string line1;
    std::getline(std::cin, line1);
    std::stringstream ss(line1);
    std::vector<int> nums;
    int x;
    while (ss >> x) nums.push_back(x);
    int target; std::cin >> target;
    std::cout << solve(nums, target) << std::endl;
    return 0;
}
""",
}

_CPP_HEADER = "#include <bits/stdc++.h>\nusing namespace std;\n\n"

_JAVA_MAIN = {
    ("count_then_list", "int"): """
import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        String[] parts = n > 0 ? sc.nextLine().trim().split("\\s+") : new String[0];
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        long result = Solution.solve(nums);
        System.out.println(result);
    }
}
""",
    ("single_string", "string"): """
import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        System.out.println(Solution.solve(s));
    }
}
""",
    ("single_string", "bool_lower"): """
import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        System.out.println(Solution.solve(s) ? "true" : "false");
    }
}
""",
    ("single_int", "string_lines"): """
import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        List<String> result = Solution.solve(n);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.size(); i++) {
            sb.append(result.get(i));
            if (i + 1 < result.size()) sb.append("\\n");
        }
        System.out.println(sb.toString());
    }
}
""",
    ("single_int", "int"): """
import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        long result = Solution.solve(n);
        System.out.println(result);
    }
}
""",
    ("single_int", "bool_lower"): """
import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        System.out.println(Solution.solve(n) ? "true" : "false");
    }
}
""",
    ("list_then_target", "int_pair"): """
import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] parts = sc.nextLine().trim().split("\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        int target = Integer.parseInt(sc.nextLine().trim());
        int[] result = Solution.solve(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}
""",
    ("list_then_target", "int"): """
import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] parts = sc.nextLine().trim().split("\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        int target = Integer.parseInt(sc.nextLine().trim());
        long result = Solution.solve(nums, target);
        System.out.println(result);
    }
}
""",
}


def _run_subprocess(cmd: List[str], stdin_text: str, cwd: str, timeout: int) -> Dict:
    start = time.time()
    try:
        proc = subprocess.run(
            cmd, input=stdin_text, capture_output=True, text=True,
            timeout=timeout, cwd=cwd,
        )
        elapsed_ms = int((time.time() - start) * 1000)
        return {"stdout": proc.stdout, "stderr": proc.stderr, "returncode": proc.returncode, "timed_out": False, "elapsed_ms": elapsed_ms}
    except subprocess.TimeoutExpired:
        elapsed_ms = int((time.time() - start) * 1000)
        return {"stdout": "", "stderr": f"Timed out after {timeout}s", "returncode": -1, "timed_out": True, "elapsed_ms": elapsed_ms}


def _compare_output(actual: str, expected: str) -> bool:
    return actual.strip() == expected.strip()


def _run_test_cases(build_cmd, test_cases: List[Dict], cwd: str, timeout: int, max_workers: int = 8) -> List[Dict]:
    """Runs build_cmd(test_case) -> List[str] against every test case
    CONCURRENTLY via a thread pool, instead of one at a time.

    Why threads work here even with Python's GIL: each call is
    subprocess.run(), which spends nearly all of its time blocked waiting
    on an OS process (interpreter/compiler startup + execution) -- that
    wait releases the GIL, so multiple test cases genuinely run in
    parallel on the OS level. This matters a lot now that hidden test
    cases went from 2 to 10 per question: submitting an assessment with
    5 coding questions used to mean up to 50 sequential process spawns
    (5 x 10), each paying full interpreter/JVM/binary startup cost one
    after another. Running them concurrently collapses that to roughly
    the cost of the slowest single test case per question, times
    ceil(10 / max_workers) batches, rather than the sum of all 10.

    Order of `results` matches the order of `test_cases` regardless of
    which one finishes first.
    """
    results: List[Optional[Dict]] = [None] * len(test_cases)

    def _one(i, tc):
        r = _run_subprocess(build_cmd(tc), tc["input"], cwd, timeout)
        return i, tc, r

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = [pool.submit(_one, i, tc) for i, tc in enumerate(test_cases)]
        for future in concurrent.futures.as_completed(futures):
            i, tc, r = future.result()
            if r["timed_out"]:
                results[i] = {"passed": False, "expected": tc["output"], "actual": "", "error": "Time limit exceeded"}
            elif r["returncode"] != 0:
                results[i] = {"passed": False, "expected": tc["output"], "actual": "", "error": r["stderr"][-500:]}
            else:
                passed = _compare_output(r["stdout"], tc["output"])
                results[i] = {"passed": passed, "expected": tc["output"], "actual": r["stdout"].strip(), "error": None}

    return results


def run_code(language: str, code: str, test_cases: List[Dict], input_pattern: str, output_pattern: str) -> Dict:
    status = toolchain_status()
    if not status.get(language):
        return {
            "passed": 0, "total": len(test_cases), "runtime": "0ms",
            "results": [], "compile_error": f"'{language}' toolchain not found on this server.",
        }

    tmpdir = tempfile.mkdtemp(prefix="hiremind_exec_")
    try:
        if language == "python":
            return _run_python(code, test_cases, input_pattern, output_pattern, tmpdir)
        elif language == "javascript":
            return _run_javascript(code, test_cases, input_pattern, output_pattern, tmpdir)
        elif language == "cpp":
            return _run_cpp(code, test_cases, input_pattern, output_pattern, tmpdir)
        elif language == "java":
            return _run_java(code, test_cases, input_pattern, output_pattern, tmpdir)
        else:
            return {"passed": 0, "total": len(test_cases), "runtime": "0ms", "results": [], "compile_error": f"Unsupported language '{language}'."}
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


def _run_python(code, test_cases, input_pattern, output_pattern, tmpdir):
    driver = _PY_DRIVER.format(input_pattern=input_pattern, output_pattern=output_pattern)
    full_source = code + "\n\n" + driver
    path = os.path.join(tmpdir, "sol.py")
    with open(path, "w") as f:
        f.write(full_source)

    total_start = time.time()
    results = _run_test_cases(lambda tc: ["python3", path], test_cases, tmpdir, TIMEOUT_SECONDS)
    total_ms = int((time.time() - total_start) * 1000)
    return {"passed": sum(1 for r in results if r["passed"]), "total": len(results), "runtime": f"{total_ms}ms", "results": results, "compile_error": None}


def _run_javascript(code, test_cases, input_pattern, output_pattern, tmpdir):
    driver = _JS_DRIVER.format(input_pattern=input_pattern, output_pattern=output_pattern)
    full_source = code + "\n\n" + driver
    path = os.path.join(tmpdir, "sol.js")
    with open(path, "w") as f:
        f.write(full_source)

    total_start = time.time()
    results = _run_test_cases(lambda tc: ["node", path], test_cases, tmpdir, TIMEOUT_SECONDS)
    total_ms = int((time.time() - total_start) * 1000)
    return {"passed": sum(1 for r in results if r["passed"]), "total": len(results), "runtime": f"{total_ms}ms", "results": results, "compile_error": None}


def _run_cpp(code, test_cases, input_pattern, output_pattern, tmpdir):
    key = (input_pattern, output_pattern)
    main_tpl = _CPP_MAIN.get(key)
    if main_tpl is None:
        return {"passed": 0, "total": len(test_cases), "runtime": "0ms", "results": [], "compile_error": f"No C++ driver for pattern {key} yet."}

    full_source = _CPP_HEADER + code + "\n\n" + main_tpl
    src_path = os.path.join(tmpdir, "sol.cpp")
    bin_path = os.path.join(tmpdir, "sol_bin")
    with open(src_path, "w") as f:
        f.write(full_source)

    compile_proc = subprocess.run(["g++", "-O2", "-o", bin_path, src_path], capture_output=True, text=True, timeout=COMPILE_TIMEOUT_SECONDS)
    if compile_proc.returncode != 0:
        return {"passed": 0, "total": len(test_cases), "runtime": "0ms", "results": [], "compile_error": compile_proc.stderr[-1000:]}

    total_start = time.time()
    results = _run_test_cases(lambda tc: [bin_path], test_cases, tmpdir, TIMEOUT_SECONDS)
    total_ms = int((time.time() - total_start) * 1000)
    return {"passed": sum(1 for r in results if r["passed"]), "total": len(results), "runtime": f"{total_ms}ms", "results": results, "compile_error": None}


def _run_java(code, test_cases, input_pattern, output_pattern, tmpdir):
    key = (input_pattern, output_pattern)
    main_src = _JAVA_MAIN.get(key)
    if main_src is None:
        return {
            "passed": 0, "total": len(test_cases), "runtime": "0ms", "results": [],
            "compile_error": f"Java isn't wired up for this question yet (pattern {key} not implemented). Python/JavaScript/C++ are fully supported.",
        }

    solution_path = os.path.join(tmpdir, "Solution.java")
    main_path = os.path.join(tmpdir, "Main.java")
    with open(solution_path, "w") as f:
        f.write(code)
    with open(main_path, "w") as f:
        f.write(main_src)

    compile_proc = subprocess.run(["javac", "Solution.java", "Main.java"], capture_output=True, text=True, timeout=COMPILE_TIMEOUT_SECONDS, cwd=tmpdir)
    if compile_proc.returncode != 0:
        return {"passed": 0, "total": len(test_cases), "runtime": "0ms", "results": [], "compile_error": compile_proc.stderr[-1000:]}

    total_start = time.time()
    # Lower max_workers than the other languages: each JVM process is
    # much heavier on memory/startup than python3/node/a native binary,
    # so running 10 of them fully concurrently risks resource pressure on
    # a modest machine. 4 concurrent still gives a real speedup over
    # fully sequential without that risk.
    results = _run_test_cases(lambda tc: ["java", "-cp", tmpdir, "Main"], test_cases, tmpdir, TIMEOUT_SECONDS, max_workers=4)
    total_ms = int((time.time() - total_start) * 1000)
    return {"passed": sum(1 for r in results if r["passed"]), "total": len(results), "runtime": f"{total_ms}ms", "results": results, "compile_error": None}
    total_ms = int((time.time() - total_start) * 1000)
    return {"passed": sum(1 for r in results if r["passed"]), "total": len(results), "runtime": f"{total_ms}ms", "results": results, "compile_error": None}
