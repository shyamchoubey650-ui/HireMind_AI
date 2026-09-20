# FROM python:3.11-slim

# WORKDIR /app

# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# COPY . .

# EXPOSE 8000
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]




FROM python:3.11-slim

WORKDIR /app

# Install toolchains needed by code_executor.py for JavaScript, C++, and Java
# - nodejs: for `node` (JavaScript execution)
# - g++ (build-essential): for `g++` (C++ compilation)
# - default-jdk: for `javac` and `java` (Java compilation + execution)
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    npm \
    build-essential \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
