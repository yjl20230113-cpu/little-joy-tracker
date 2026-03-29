function isExtendedLengthWindowsPath(value) {
  return typeof value === "string" && value.startsWith("\\\\?\\");
}

function normalizeWindowsWorkingDirectory(value) {
  if (!isExtendedLengthWindowsPath(value)) {
    return value;
  }

  return value.slice(4);
}

module.exports = {
  isExtendedLengthWindowsPath,
  normalizeWindowsWorkingDirectory,
};
