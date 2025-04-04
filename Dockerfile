FROM python:3.10-slim

WORKDIR /code

COPY requirements.txt .

# Force reinstall all packages to ensure discord is properly installed
RUN pip install --no-cache-dir --force-reinstall -r requirements.txt

# Install discord.py explicitly
RUN pip install --no-cache-dir discord.py

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 