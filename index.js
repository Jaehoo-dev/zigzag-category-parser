const fs = require('fs');

const rawJsonData = fs.readFileSync('zigzag-categories.json');
const rawCategoryData = JSON.parse(rawJsonData.toString());
const {
  data: { category: root },
} = rawCategoryData;

delete root.id;
delete root.name;

function cleanUpData() {}

function cleanUpAssetList(assets) {
  const filtered = assets.filter(
    asset => asset.value !== 'false' && asset.value !== 'flase'
  );

  return filtered.map(attribute => ({
    key: attribute.key,
    values: attribute.value.split(';'),
  }));
}

const newCategoryData = JSON.stringify(root);

fs.writeFileSync('output.json', newCategoryData);
