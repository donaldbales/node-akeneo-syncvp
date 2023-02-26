import * as bunyan from 'bunyan';
import * as fs from 'fs';
import * as pim1 from 'node-akeneo-api';
// hack to get a second instance of node-akeneo-api.
for (const property in require.cache) {
  if (property.indexOf('node-akeneo-api') !== -1) {
    delete require.cache[property];
    break;
  }
}
import * as pim2 from 'node-akeneo-api';
// end of hack;
import * as path from 'path';
import * as util from 'util';
import Logger from 'bunyan';

const moduleName: string = 'node-akeneo-syncvp';

let logger: Logger = bunyan.createLogger({ name: moduleName });
export function setLogger(loggerIn: Logger) {
  logger = loggerIn;
}

async function deltaCatalog(filename: string, keys: any): Promise<number> {
  const methodName: string = 'deltaCatalog';
  logger.info({ moduleName, methodName, filename, keys }, `Starting...`);

  let results: number = 0;

  const pim1Map: Map<string, any> = new Map();
  await pim1.load(path.join(pim1.exportPath, filename), pim1Map, keys);
  const pim2Map: Map<string, any> = new Map();
  await pim2.load(path.join(pim2.exportPath, filename), pim2Map, keys);

  const fileDesc: number = await pim1.open(path.join(pim1.exportPath, 'deltas', filename), 'w');
  for (const key of pim1Map.keys()) {
    const pim1Obj: any = pim1Map.get(key); 
    const pim2Obj: any = pim2Map.get(key); 
    if (!(pim2Obj) ||
        !(same(pim1Obj, pim2Obj))) {
      ++results;
      await pim1.write(fileDesc, `${JSON.stringify(pim1Obj)}\n`);
    }
  }
  await pim1.close(fileDesc);

  return results;
}

function inspect(obj: any, depth: number = 5): string {
  return `${util.inspect(obj, true, depth, false)}`;
}

async function main(...args: string[]): Promise<any> {
  const methodName: string = 'main';
  const loggerLevel: any = (process.env.LOG_LEVEL as string) || 'info';
  logger.level(loggerLevel);
  const started: Date = new Date(); 
  logger.info({ moduleName, methodName, started },` Starting...`);

  pim1.setLogger(logger);

  pim1.setBaseUrl((process.env.PIM1_AKENEO_BASE_URL as string) || '');
  pim1.setClientId((process.env.PIM1_AKENEO_CLIENT_ID as string) || '');
  pim1.setExportPath((process.env.PIM1_AKENEO_EXPORT_PATH as string) || '.');
  pim1.setPassword((process.env.PIM1_AKENEO_PASSWORD as string) || '');
  pim1.setSecret((process.env.PIM1_AKENEO_SECRET as string) || '');
  pim1.setUsername((process.env.PIM1_AKENEO_USERNAME as string) || '');

  pim2.setLogger(logger);

  pim2.setBaseUrl((process.env.PIM2_AKENEO_BASE_URL as string) || '');
  pim2.setClientId((process.env.PIM2_AKENEO_CLIENT_ID as string) || '');
  pim2.setExportPath((process.env.PIM2_AKENEO_EXPORT_PATH as string) || '.');
  pim2.setPassword((process.env.PIM2_AKENEO_PASSWORD as string) || '');
  pim2.setSecret((process.env.PIM2_AKENEO_SECRET as string) || '');
  pim2.setUsername((process.env.PIM2_AKENEO_USERNAME as string) || '');

  pim1.unlink(path.join(pim1.exportPath, pim1.filenameAssociationTypes));
  pim1.unlink(path.join(pim1.exportPath, pim1.filenameAttributeGroups));
  pim1.unlink(path.join(pim1.exportPath, pim1.filenameAttributeOptions));
  pim1.unlink(path.join(pim1.exportPath, pim1.filenameAttributes));
  pim1.unlink(path.join(pim1.exportPath, pim1.filenameCategories));
  pim1.unlink(path.join(pim1.exportPath, pim1.filenameChannels));
  pim1.unlink(path.join(pim1.exportPath, pim1.filenameFamilies));
  pim1.unlink(path.join(pim1.exportPath, pim1.filenameFamilyVariants));
  pim1.unlink(path.join(pim1.exportPath, pim1.filenameProductModels));
  pim1.unlink(path.join(pim1.exportPath, pim1.filenameProducts));

  pim2.unlink(path.join(pim2.exportPath, pim2.filenameAssociationTypes));
  pim2.unlink(path.join(pim2.exportPath, pim2.filenameAttributeGroups));
  pim2.unlink(path.join(pim2.exportPath, pim2.filenameAttributeOptions));
  pim2.unlink(path.join(pim2.exportPath, pim2.filenameAttributes));
  pim2.unlink(path.join(pim2.exportPath, pim2.filenameCategories));
  pim2.unlink(path.join(pim2.exportPath, pim2.filenameChannels));
  pim2.unlink(path.join(pim2.exportPath, pim2.filenameFamilies));
  pim2.unlink(path.join(pim2.exportPath, pim2.filenameFamilyVariants));
  pim2.unlink(path.join(pim2.exportPath, pim2.filenameProductModels));
  pim2.unlink(path.join(pim2.exportPath, pim2.filenameProducts));

  let results: any = null;

  results = await Promise.all([
    pim1.exportAssociationTypes(),
    pim1.exportAttributeGroups(),
    pim1.exportAttributes(),
    pim1.exportChannels(),
    pim1.exportFamilies(),

    pim2.exportAssociationTypes(),
    pim2.exportAttributeGroups(),
    pim2.exportAttributes(),
    pim2.exportChannels(),
    pim2.exportFamilies()

  ]);

  const products: any = await pim2.exportProducts('search={' +
    '"enabled":[{"operator":"=","value":true}],' +
    '"completeness":[{"operator":"=","value":100,"scope":"ecommerce"}]' +
    '}');

  console.log('\n');

  await pim1.mkdir(path.join(pim1.exportPath, 'deltas'));
  await pim2.mkdir(path.join(pim2.exportPath, 'deltas'));
  await pim2.unlink(path.join(pim2.exportPath, 'deltas', pim2.filenameProductMediaFiles));
  await pim2.symlink(path.join(process.cwd(), pim2.exportPath, pim2.filenameProductMediaFiles),
                     path.join(process.cwd(), pim2.exportPath, 'deltas', pim2.filenameProductMediaFiles));

  const pim1ProductMediaFilesMap: Map<string, any> = new Map();
  await pim1.load(path.join(pim1.exportPath, pim1.filenameProductMediaFiles), pim1ProductMediaFilesMap, 'fromData');

  const pim2ProductMediaFilesMap: Map<string, any> = new Map();
  await pim2.load(path.join(pim2.exportPath, pim2.filenameProductMediaFiles), pim2ProductMediaFilesMap, 'fromData');
  if (pim2ProductMediaFilesMap.size === 0) {
    for (const value of pim1ProductMediaFilesMap.values()) {
      delete value.toData;
      delete value.toHref;
    }
  }

  const transformedAttributes: number = await transformAttributes();
  const transformedAttributeGroups: number = await transformAttributeGroups();
  const transformedFamilies: number = await transformFamilies();

  const channels: number = await deltaCatalog(pim1.filenameChannels, 'code');
  const associationTypes: number = await deltaCatalog(pim1.filenameAssociationTypes, 'code');
  const attributeGroups: number = await deltaCatalog(pim1.filenameAttributeGroups, 'code');
  const attributes: number = await deltaCatalog(pim1.filenameAttributes, 'code');
  const attributeOptions: number = await deltaCatalog(pim1.filenameAttributeOptions, ['attribute', 'code']);
  const families: number = await deltaCatalog(pim1.filenameFamilies, 'code');
//  const familyVariants: number = await deltaCatalog(pim1.filenameFamilyVariants, 'code');

/*
  for (const char of ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f']) {
    await pim2.unlink(path.join(pim2.exportPath, 'deltas', char));
    await pim2.symlink(path.join(process.cwd(), pim2.exportPath, char),
                       path.join(process.cwd(), pim2.exportPath, 'deltas', char));
  }

  const fileDesc: number = await pim2.open(path.join(pim2.exportPath, pim2.filenameProductMediaFiles), 'w');
  for (const value of pim2ProductMediaFilesMap.values()) {
    await pim2.write(fileDesc, `${JSON.stringify(value)}\n`);
  }
  await pim2.close(fileDesc);
*/

  console.log('\n');

  const originalPim2ExportPath: string = pim2.exportPath;

  pim2.setExportPath(path.join(pim1.exportPath, 'deltas'));

  results = channels ? await pim2.importChannels() : null;
  results = associationTypes ? await pim2.importAssociationTypes() : null;
  results = attributeGroups ? await pim2.importAttributeGroups() : null;
  results = attributes ? await pim2.importAttributes() : null;
  results = attributeOptions ? await pim2.importAttributeOptions() : null;
  results = families ? await pim2.importFamilies() : null;
//  results = familyVariants ? await pim2.importFamilyVariants() : null;

  pim2.setExportPath(originalPim2ExportPath);

  results = products ? await transformProducts() : null;

  const stopped: Date = new Date();
  const duration: string = ((stopped.getTime() - started.getTime()) / 1000).toLocaleString('en-US');
  const heapUsed: string = process.memoryUsage().heapUsed.toLocaleString('en-US');
  logger.info({ moduleName, methodName, heapUsed, started, stopped, duration },`in seconds`);
}

export function now(): string {
  return new Date().toISOString().replace(/[\-\.:TZ]/g, '').slice(0, 14);
}

export function rename(oldPath: string, newPath: string): Promise<any> {
  const methodName: string = 'rename';
  return new Promise((resolve: any, reject: any) => {
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        logger.error({ moduleName, methodName, error: inspect(err) });
        return reject(err);
      } else {
        return resolve({});
      }
    });
  });
}

function same(obj: any, oth: any): boolean {
  if (obj &&
      obj['updated']) {
    delete obj['updated'];
  }
  if (oth &&
      oth['updated']) {
    delete oth['updated'];
  }
  return Array.from(JSON.stringify(obj)).sort().toString() ===
         Array.from(JSON.stringify(oth)).sort().toString();
}

function splitMediaFileData(data: string): any {
  const methodName: string = 'splitMediaFileData';
  // the underscore is used to separate the guid from the actual filename
  const results: any = {};
  const firstUnderscoreAt: number = data.indexOf('_');
  if (firstUnderscoreAt !== -1) {
    results.path = data.slice(0, firstUnderscoreAt);
    results.name = data.slice(firstUnderscoreAt + 1, data.length);
  } else {
    results.path = '';
    results.name = data;
  }

  return results;
}

//  Don't import sku or vendor_sku
//  Don't import attribute types:
//    AKENEO_REFERENCE_ENTITY_COLLECTION
//    PIM_CATALOG_ASSET_COLLECTION
//    PIM_CATALOG_IDENTIFIER
//    PIM_REFERENCE_DATA_MULTISELECT
//    PIM_REFERENCE_DATA_SIMPLESELECT
const transformedAttributesMap: Map<string, any> = new Map();
export async function transformAttributes(): Promise<any> {
  const methodName: string = 'transformAttributes';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(pim1.exportPath, pim1.filenameAttributes);
  let fileDesc: number = await pim1.open(fileName, 'r');
  const buffer: string = (await pim1.read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await pim1.close(fileDesc);
  await rename(fileName, `${fileName}.${now()}`);
  fileDesc = await pim1.open(fileName, 'w');
  if (buffer.length > 0) {
    const attributes: any[] = JSON.parse(`[ ${buffer} ]`);
    // pim 6 introduced property group_labels, which doesn't exist in the pim, so delete it.
    for (const attribute of attributes) {
      delete attribute.group_labels;
    }
    const transformedAttributes: any[] = [];
    for (const attribute of attributes) {
      if (attribute.code !== 'sku' &&
          attribute.code !== 'vendor_sku' &&
          attribute.type !== pim2.AKENEO_REFERENCE_ENTITY_COLLECTION &&
          attribute.type !== pim2.PIM_CATALOG_ASSET_COLLECTION &&
          attribute.type !== pim2.PIM_CATALOG_IDENTIFIER &&
          attribute.type !== pim2.PIM_REFERENCE_DATA_MULTISELECT &&
          attribute.type !== pim2.PIM_REFERENCE_DATA_SIMPLESELECT) {
        await pim1.write(fileDesc, `${JSON.stringify(attribute)}\n`);
        transformedAttributesMap.set(attribute.code, attribute);
      }
    }
  }
  await pim1.close(fileDesc);

  return transformedAttributesMap.size;
}

const transformedAttributeGroupsMap: Map<string, any> = new Map();

// Don't import attribute group admin
export async function transformAttributeGroups(): Promise<any> {
  const methodName: string = 'transformAttributeGroups';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(pim1.exportPath, pim1.filenameAttributeGroups);
  let fileDesc: number = await pim1.open(fileName, 'r');
  const buffer: string = (await pim1.read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await pim1.close(fileDesc);
  await rename(fileName, `${fileName}.${now()}`);
  fileDesc = await pim1.open(fileName, 'w');
  if (buffer.length > 0) {
    const attributeGroups: any[] = JSON.parse(`[ ${buffer} ]`);
    // attribute groups point to attributes,
    // and attributes point to attribute groups,
    // so let's unlink attribute groups.
    for (const attributeGroup of attributeGroups) {
      attributeGroup.attributes = [];
    }
    for (const attributeGroup of attributeGroups) {
      if (attributeGroup.code !== 'admin') {
        await pim1.write(fileDesc, `${JSON.stringify(attributeGroup)}\n`);
        transformedAttributeGroupsMap.set(attributeGroup.code, attributeGroup);
      }
    }
  }
  await pim1.close(fileDesc);

  return transformedAttributeGroupsMap.size;
}

const transformedFamiliesMap: Map<string, any> = new Map();

// Don't update required attributes
// Remove un-transformed attributes
export async function transformFamilies(): Promise<any> {
  const methodName: string = 'transformFamilies';
  logger.info({ moduleName, methodName }, 'Starting...');

  const pim2FileName: string = path.join(pim2.exportPath, pim2.filenameFamilies);
  const pim2FamiliesMap: Map<string, any> = new Map();
  await pim2.load(pim2FileName, pim2FamiliesMap, 'code');

  const fileName: string = path.join(pim1.exportPath, pim1.filenameFamilies);
  let fileDesc: number = await pim1.open(fileName, 'r');
  const buffer: string = (await pim1.read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await pim1.close(fileDesc);
  await rename(fileName, `${fileName}.${now()}`);
  fileDesc = await pim1.open(fileName, 'w');
  if (buffer.length > 0) {
    const families: any[] = JSON.parse(`[ ${buffer} ]`);
    for (const family of families) {
      const transformedFamily: any = JSON.parse(JSON.stringify(family));
      let attributeCodes: any[] = transformedFamily.attributes || [];
      let transformedAttributeCodes: any[] = [ 'sku', 'admin_sku' ];
      for (const attributeCode of attributeCodes) {
        const attribute: any = transformedAttributesMap.get(attributeCode);
        if (attribute) {
          transformedAttributeCodes.push(attribute.code)
        }
      }
      transformedFamily.attributes = JSON.parse(JSON.stringify(transformedAttributeCodes.sort()));

      const pim2Family: any = pim2FamiliesMap.get(family.code);
      if (pim2Family) {
        transformedFamily.attribute_requirements = JSON.parse(JSON.stringify(pim2Family.attribute_requirements));
      }

      await pim1.write(fileDesc, `${JSON.stringify(transformedFamily)}\n`);
      transformedFamiliesMap.set(transformedFamily.code, transformedFamily);
    }
  }
  await pim1.close(fileDesc);

  return transformedFamiliesMap.size;
}

// Don't import categories
// Swap sku with vendor_sku
// Swap admin_sku with sku
// delete complete, sku'd and synced product from VP
// search={"enabled":[{"operator":"=","value":true}],"completeness":[{"operator":"=","value":100,"scope":"ecommerce"}]}
async function transformProducts(): Promise<any> {
  const methodName: string = 'transformProducts';
  logger.info({ moduleName, methodName }, 'Starting...');

  let results: number = 0;

  const fileName: string = path.join(pim2.exportPath, pim2.filenameProducts);
  let fileDesc: number = await pim2.open(fileName, 'r');
  const buffer: string = (await pim2.read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await pim2.close(fileDesc);
  await rename(fileName, `${fileName}.${now()}`);
  fileDesc = await pim2.open(fileName, 'w');
  if (buffer.length > 0) {
    const products: any[] = JSON.parse(`[ ${buffer} ]`);
    for (const product of products) {
      const admin_sku: string =
        product.values &&
        product.values.admin_sku &&
        product.values.admin_sku[0] ?
        product.values.admin_sku[0].data : '';
      if (admin_sku) {
        // build the destination (pim1) product swaping skus
        const vendor_sku: string = product.identifier;
        const transformedProduct: any = {
          identifier: admin_sku,
          family: product.family,
          values: product.values
        };
        delete product.values.admin_sku;
        product.values.vendor_sku = [ { locale: null, scope: null, data: vendor_sku } ];
        // add the product to pim1
        const pim1PatchResults: any = await pim1.patch(pim1.apiUrlProducts(admin_sku), transformedProduct);
        logger.info({ moduleName, methodName, pim1PatchResults });
        if (pim1PatchResults &&
            pim1PatchResults.statusCode < 300) {
          // verify the product is in pim1
          const pim1GetResults: any = await pim1.get(pim1.apiUrlProducts(admin_sku));
          logger.info({ moduleName, methodName, pim1GetResults });
          if (pim1GetResults &&
              pim1GetResults[0] &&
              pim1GetResults[0].statusCode === 200 &&
              pim1GetResults[0].values) {
            const pim1Values: any = pim1GetResults[0].values;
            const pim2Values: any = transformedProduct.values;
            let verified: boolean = true;
            for (const pim2Value in pim2Values) {
              const pim1Data: any = pim1Values[pim2Value][0].data;
              const pim2Data: any = pim2Values[pim2Value][0].data;
              if (pim1Data instanceof Array) {
                pim1Data.sort();
              }
              if (pim2Data instanceof Array) {
                pim2Data.sort();
              }
              if (JSON.stringify(pim1Data) !== JSON.stringify(pim2Data)) {
                verified = false;
              }
            }
            if (verified) {
              // delete the product from pim2
              const pim2DeleteResults: any = await pim2.delete_(pim2.apiUrlProducts(vendor_sku), {});
              logger.info({ moduleName, methodName, pim2DeleteResults });
              if (pim2DeleteResults &&
                  pim2DeleteResults.statusCode === 204) {
                ++results;
              }
            }
          }
        }
      }
    }
  }

  return results;
}

// Start the program
if (require.main === module) {
  main();
}
