const fs = require('fs');

const rawJsonData = fs.readFileSync('zigzag-categories.json');
const rawCategoryData = JSON.parse(rawJsonData.toString());
const {
  data: { category: root },
} = rawCategoryData;

delete root.id;
delete root.name;

function parseRawData(root, depth = 0) {
  if (root.asset_list?.length || !root.children) {
    root.attributes = root.asset_list && cleanUpAssetList(root.asset_list);

    delete root.children;
    delete root.asset_list;

    return;
  }

  root.subcategories = parseChildrenToTree(root.children);

  for (const id in root.subcategories) {
    const category = root.subcategories[id];

    parseRawData(category, depth + 1);

    if (depth) {
      delete root.children;
    }
  }

  return root;
}

function parseChildrenToTree(children) {
  const result = {};

  children.forEach(child => {
    result[child.id] = {
      name: child.name,
      children: child.children,
    };

    if (child.asset_list.length) {
      result[child.id].asset_list = child.asset_list;
    }
  });

  return result;
}

function cleanUpAssetList(assets) {
  const filtered = assets.filter(
    asset => asset.value !== 'false' && asset.value !== 'flase'
  );

  return filtered.map(attribute => ({
    key: attribute.key,
    values: attribute.value.split(';'),
  }));
}

const newCategoryData = JSON.stringify(parseRawData(root));

fs.writeFileSync('output.json', newCategoryData);
