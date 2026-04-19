import kagglehub
import shutil
import os

# Download latest version
path = kagglehub.dataset_download("a7md19/adhd-dataset-4-classes-u2")

print("Path to dataset files:", path)

# Define target location in the project
target_dir = os.path.join(os.getcwd(), 'public', 'dataset')

# Create target directory if it doesn't exist
if not os.path.exists(target_dir):
    os.makedirs(target_dir)

# Move files to the target directory
for filename in os.listdir(path):
    src = os.path.join(path, filename)
    dst = os.path.join(target_dir, filename)
    if os.path.isdir(src):
        if os.path.exists(dst):
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
    else:
        shutil.copy2(src, dst)

print(f"Dataset moved to: {target_dir}")
