/**
 * Returns a list of unique tags from all collection items.
 * Filters out common structural tags.
 */
const EXCLUDED_TAGS = new Set(["all", "nav", "post", "posts"]);

module.exports = function (collection) {
  const tagSet = new Set();

  for (const item of collection.getAll()) {
    const tags = item.data?.tags;
    if (!tags) continue;

    for (const tag of tags) {
      if (!EXCLUDED_TAGS.has(tag)) {
        tagSet.add(tag);
      }
    }
  }

  return [...tagSet].sort();
};
