import os
import sys
from alembic import command
from alembic.config import Config

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))
# Get the parent directory (project root)
project_root = os.path.dirname(script_dir)

# Change to the project root directory
os.chdir(project_root)

# Create an Alembic configuration object
alembic_cfg = Config("alembic.ini")

# Create the initial migration
command.revision(alembic_cfg, autogenerate=True, message="initial")

print("Initial migration created successfully!") 