import os

def batch_rename(
    directory, 
    prefix="", 
    suffix="", 
    new_extension=None, 
    start_number=0
):
    """
    Batch renames all files in a directory.

    Parameters:
        directory (str): Path to the directory containing files to rename.
        prefix (str): Text to add at the beginning of each filename.
        suffix (str): Text to add at the end (before the extension).
        new_extension (str): Replace file extension (e.g., "jpg", "txt"), or None to keep existing.
        start_number (int): Starting number for sequence naming.
    """

    # Ensure directory exists
    if not os.path.isdir(directory):
        print(f"❌ Directory not found: {directory}")
        return

    files = sorted(os.listdir(directory))
    counter = start_number

    for filename in files:
        old_path = os.path.join(directory, filename)

        # Skip directories
        if os.path.isdir(old_path):
            continue

        name, ext = os.path.splitext(filename)
        ext = ext.lstrip(".")

        # Build new filename
        new_name = "SectorAni" + str(counter) + ".jpg"
        new_path = os.path.join(directory, new_name)

        # Rename file
        os.rename(old_path, new_path)
        print(f"✅ Renamed: {filename} → {new_name}")
        counter += 1

    print("\n🎉 Batch renaming complete!")


if __name__ == "__main__":
    # Example usage:
    folder_path = input("Enter directory path: ").strip()
    prefix = input("Enter prefix (optional): ").strip()
    suffix = input("Enter suffix (optional): ").strip()
    new_ext = input("Enter new extension (optional, e.g. 'jpg' or leave blank): ").strip() or None

    batch_rename(folder_path, prefix, suffix, new_ext)
