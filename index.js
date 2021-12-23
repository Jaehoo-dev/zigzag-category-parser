const fs = require('fs');

const rawJsonData = fs.readFileSync('zigzag-category-data-op.json');
const rawCategoryData = JSON.parse(rawJsonData.toString());
const {
  data: { category: root },
} = rawCategoryData;

delete root.id;
delete root.name;

function parseRawData(root) {
  if (!root.children || !root.children.length) {
    root.attributes = root.asset_list && cleanUpAssetList(root.asset_list);

    delete root.children;
    delete root.asset_list;

    return;
  }

  delete root.asset_list;

  root.categoryTree = parseChildrenToTree(root.children);

  for (const id in root.categoryTree) {
    const category = root.categoryTree[id];

    parseRawData(category);
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

const assetKeys = [
  'length',
  'fit',
  'detail',
  'material',
  'pattern',
  'sleeve_length',
];

function cleanUpAssetList(assets) {
  const filtered = assets.filter(asset => assetKeys.indexOf(asset.key) > -1);

  return filtered.map(attribute => ({
    key: attribute.key,
    values: attribute.value.split(';'),
  }));
}

function cleanUpTree(tree) {
  if (!tree.categoryTree) return;

  for (const id in tree.categoryTree) {
    const category = tree.categoryTree[id];

    if (!category.children) continue;

    category.children.forEach(child => {
      delete child.children;
      delete child.asset_list;
    });

    cleanUpTree(category);
  }

  return tree;
}

const result = cleanUpTree(parseRawData(root));

result.children = result.children.map(child => ({
  id: child.id,
  name: child.name,
}));

fs.writeFileSync('output.json', JSON.stringify(result));
