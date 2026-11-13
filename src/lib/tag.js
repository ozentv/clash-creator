const TAG_PATTERN = /^[0289PYLQGRJCUV]{3,12}$/;

// "#2pp o" -> "2PP0" ; renvoie null si le tag ne peut pas être valide.
export function normalizeTag(input) {
  const tag = input.trim().toUpperCase().replace(/^#/, '').replace(/\s/g, '').replace(/O/g, '0');
  return TAG_PATTERN.test(tag) ? tag : null;
}
