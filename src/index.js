"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bunyan = require("bunyan");
const fs = require("fs");
const pim1 = require("node-akeneo-api");
// hack to get a second instance of node-akeneo-api.
for (const property in require.cache) {
    if (property.indexOf('node-akeneo-api') !== -1) {
        delete require.cache[property];
        break;
    }
}
const pim2 = require("node-akeneo-api");
// end of hack;
const path = require("path");
const util = require("util");
const moduleName = 'node-akeneo-syncvp';
let logger = bunyan.createLogger({ name: moduleName });
function setLogger(loggerIn) {
    logger = loggerIn;
}
exports.setLogger = setLogger;
function deltaCatalog(filename, keys) {
    return __awaiter(this, void 0, void 0, function* () {
        const methodName = 'deltaCatalog';
        logger.info({ moduleName, methodName, filename, keys }, `Starting...`);
        let results = 0;
        const pim1Map = new Map();
        yield pim1.load(path.join(pim1.exportPath, filename), pim1Map, keys);
        const pim2Map = new Map();
        yield pim2.load(path.join(pim2.exportPath, filename), pim2Map, keys);
        const fileDesc = yield pim1.open(path.join(pim1.exportPath, 'deltas', filename), 'w');
        for (const key of pim1Map.keys()) {
            const pim1Obj = pim1Map.get(key);
            const pim2Obj = pim2Map.get(key);
            if (!(pim2Obj) ||
                !(same(pim1Obj, pim2Obj))) {
                ++results;
                yield pim1.write(fileDesc, `${JSON.stringify(pim1Obj)}\n`);
            }
        }
        yield pim1.close(fileDesc);
        return results;
    });
}
function inspect(obj, depth = 5) {
    return `${util.inspect(obj, true, depth, false)}`;
}
function main(...args) {
    return __awaiter(this, void 0, void 0, function* () {
        const methodName = 'main';
        const loggerLevel = process.env.LOG_LEVEL || 'info';
        logger.level(loggerLevel);
        const started = new Date();
        logger.info({ moduleName, methodName, started }, ` Starting...`);
        pim1.setLogger(logger);
        pim1.setBaseUrl(process.env.PIM1_AKENEO_BASE_URL || '');
        pim1.setClientId(process.env.PIM1_AKENEO_CLIENT_ID || '');
        pim1.setExportPath(process.env.PIM1_AKENEO_EXPORT_PATH || '.');
        pim1.setPassword(process.env.PIM1_AKENEO_PASSWORD || '');
        pim1.setSecret(process.env.PIM1_AKENEO_SECRET || '');
        pim1.setUsername(process.env.PIM1_AKENEO_USERNAME || '');
        pim2.setLogger(logger);
        pim2.setBaseUrl(process.env.PIM2_AKENEO_BASE_URL || '');
        pim2.setClientId(process.env.PIM2_AKENEO_CLIENT_ID || '');
        pim2.setExportPath(process.env.PIM2_AKENEO_EXPORT_PATH || '.');
        pim2.setPassword(process.env.PIM2_AKENEO_PASSWORD || '');
        pim2.setSecret(process.env.PIM2_AKENEO_SECRET || '');
        pim2.setUsername(process.env.PIM2_AKENEO_USERNAME || '');
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
        let results = null;
        results = yield Promise.all([
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
        const products = yield pim2.exportProducts('search={' +
            '"enabled":[{"operator":"=","value":true}],' +
            '"completeness":[{"operator":"=","value":100,"scope":"ecommerce"}]' +
            '}');
        console.log('\n');
        yield pim1.mkdir(path.join(pim1.exportPath, 'deltas'));
        yield pim2.mkdir(path.join(pim2.exportPath, 'deltas'));
        yield pim2.unlink(path.join(pim2.exportPath, 'deltas', pim2.filenameProductMediaFiles));
        yield pim2.symlink(path.join(process.cwd(), pim2.exportPath, pim2.filenameProductMediaFiles), path.join(process.cwd(), pim2.exportPath, 'deltas', pim2.filenameProductMediaFiles));
        const pim1ProductMediaFilesMap = new Map();
        yield pim1.load(path.join(pim1.exportPath, pim1.filenameProductMediaFiles), pim1ProductMediaFilesMap, 'fromData');
        const pim2ProductMediaFilesMap = new Map();
        yield pim2.load(path.join(pim2.exportPath, pim2.filenameProductMediaFiles), pim2ProductMediaFilesMap, 'fromData');
        if (pim2ProductMediaFilesMap.size === 0) {
            for (const value of pim1ProductMediaFilesMap.values()) {
                delete value.toData;
                delete value.toHref;
            }
        }
        const transformedAttributes = yield transformAttributes();
        const transformedAttributeGroups = yield transformAttributeGroups();
        const transformedFamilies = yield transformFamilies();
        const channels = yield deltaCatalog(pim1.filenameChannels, 'code');
        const associationTypes = yield deltaCatalog(pim1.filenameAssociationTypes, 'code');
        const attributeGroups = yield deltaCatalog(pim1.filenameAttributeGroups, 'code');
        const attributes = yield deltaCatalog(pim1.filenameAttributes, 'code');
        const attributeOptions = yield deltaCatalog(pim1.filenameAttributeOptions, ['attribute', 'code']);
        const families = yield deltaCatalog(pim1.filenameFamilies, 'code');
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
        const originalPim2ExportPath = pim2.exportPath;
        pim2.setExportPath(path.join(pim1.exportPath, 'deltas'));
        results = channels ? yield pim2.importChannels() : null;
        results = associationTypes ? yield pim2.importAssociationTypes() : null;
        results = attributeGroups ? yield pim2.importAttributeGroups() : null;
        results = attributes ? yield pim2.importAttributes() : null;
        results = attributeOptions ? yield pim2.importAttributeOptions() : null;
        results = families ? yield pim2.importFamilies() : null;
        //  results = familyVariants ? await pim2.importFamilyVariants() : null;
        pim2.setExportPath(originalPim2ExportPath);
        results = products ? yield transformProducts() : null;
        const stopped = new Date();
        const duration = ((stopped.getTime() - started.getTime()) / 1000).toLocaleString('en-US');
        const heapUsed = process.memoryUsage().heapUsed.toLocaleString('en-US');
        logger.info({ moduleName, methodName, heapUsed, started, stopped, duration }, `in seconds`);
    });
}
function now() {
    return new Date().toISOString().replace(/[\-\.:TZ]/g, '').slice(0, 14);
}
exports.now = now;
function rename(oldPath, newPath) {
    const methodName = 'rename';
    return new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                logger.error({ moduleName, methodName, error: inspect(err) });
                return reject(err);
            }
            else {
                return resolve({});
            }
        });
    });
}
exports.rename = rename;
function same(obj, oth) {
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
function splitMediaFileData(data) {
    const methodName = 'splitMediaFileData';
    // the underscore is used to separate the guid from the actual filename
    const results = {};
    const firstUnderscoreAt = data.indexOf('_');
    if (firstUnderscoreAt !== -1) {
        results.path = data.slice(0, firstUnderscoreAt);
        results.name = data.slice(firstUnderscoreAt + 1, data.length);
    }
    else {
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
const transformedAttributesMap = new Map();
function transformAttributes() {
    return __awaiter(this, void 0, void 0, function* () {
        const methodName = 'transformAttributes';
        logger.info({ moduleName, methodName }, 'Starting...');
        const fileName = path.join(pim1.exportPath, pim1.filenameAttributes);
        let fileDesc = yield pim1.open(fileName, 'r');
        const buffer = (yield pim1.read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
        yield pim1.close(fileDesc);
        yield rename(fileName, `${fileName}.${now()}`);
        fileDesc = yield pim1.open(fileName, 'w');
        if (buffer.length > 0) {
            const attributes = JSON.parse(`[ ${buffer} ]`);
            // pim 6 introduced property group_labels, which doesn't exist in the pim, so delete it.
            for (const attribute of attributes) {
                delete attribute.group_labels;
            }
            const transformedAttributes = [];
            for (const attribute of attributes) {
                if (attribute.code !== 'sku' &&
                    attribute.code !== 'vendor_sku' &&
                    attribute.type !== pim2.AKENEO_REFERENCE_ENTITY_COLLECTION &&
                    attribute.type !== pim2.PIM_CATALOG_ASSET_COLLECTION &&
                    attribute.type !== pim2.PIM_CATALOG_IDENTIFIER &&
                    attribute.type !== pim2.PIM_REFERENCE_DATA_MULTISELECT &&
                    attribute.type !== pim2.PIM_REFERENCE_DATA_SIMPLESELECT) {
                    yield pim1.write(fileDesc, `${JSON.stringify(attribute)}\n`);
                    transformedAttributesMap.set(attribute.code, attribute);
                }
            }
        }
        yield pim1.close(fileDesc);
        return transformedAttributesMap.size;
    });
}
exports.transformAttributes = transformAttributes;
const transformedAttributeGroupsMap = new Map();
// Don't import attribute group admin
function transformAttributeGroups() {
    return __awaiter(this, void 0, void 0, function* () {
        const methodName = 'transformAttributeGroups';
        logger.info({ moduleName, methodName }, 'Starting...');
        const fileName = path.join(pim1.exportPath, pim1.filenameAttributeGroups);
        let fileDesc = yield pim1.open(fileName, 'r');
        const buffer = (yield pim1.read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
        yield pim1.close(fileDesc);
        yield rename(fileName, `${fileName}.${now()}`);
        fileDesc = yield pim1.open(fileName, 'w');
        if (buffer.length > 0) {
            const attributeGroups = JSON.parse(`[ ${buffer} ]`);
            // attribute groups point to attributes,
            // and attributes point to attribute groups,
            // so let's unlink attribute groups.
            for (const attributeGroup of attributeGroups) {
                attributeGroup.attributes = [];
            }
            for (const attributeGroup of attributeGroups) {
                if (attributeGroup.code !== 'admin') {
                    yield pim1.write(fileDesc, `${JSON.stringify(attributeGroup)}\n`);
                    transformedAttributeGroupsMap.set(attributeGroup.code, attributeGroup);
                }
            }
        }
        yield pim1.close(fileDesc);
        return transformedAttributeGroupsMap.size;
    });
}
exports.transformAttributeGroups = transformAttributeGroups;
const transformedFamiliesMap = new Map();
// Don't update required attributes
// Remove un-transformed attributes
function transformFamilies() {
    return __awaiter(this, void 0, void 0, function* () {
        const methodName = 'transformFamilies';
        logger.info({ moduleName, methodName }, 'Starting...');
        const pim2FileName = path.join(pim2.exportPath, pim2.filenameFamilies);
        const pim2FamiliesMap = new Map();
        yield pim2.load(pim2FileName, pim2FamiliesMap, 'code');
        const fileName = path.join(pim1.exportPath, pim1.filenameFamilies);
        let fileDesc = yield pim1.open(fileName, 'r');
        const buffer = (yield pim1.read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
        yield pim1.close(fileDesc);
        yield rename(fileName, `${fileName}.${now()}`);
        fileDesc = yield pim1.open(fileName, 'w');
        if (buffer.length > 0) {
            const families = JSON.parse(`[ ${buffer} ]`);
            for (const family of families) {
                const transformedFamily = JSON.parse(JSON.stringify(family));
                let attributeCodes = transformedFamily.attributes || [];
                let transformedAttributeCodes = ['sku', 'admin_sku'];
                for (const attributeCode of attributeCodes) {
                    const attribute = transformedAttributesMap.get(attributeCode);
                    if (attribute) {
                        transformedAttributeCodes.push(attribute.code);
                    }
                }
                transformedFamily.attributes = JSON.parse(JSON.stringify(transformedAttributeCodes.sort()));
                const pim2Family = pim2FamiliesMap.get(family.code);
                if (pim2Family) {
                    transformedFamily.attribute_requirements = JSON.parse(JSON.stringify(pim2Family.attribute_requirements));
                }
                yield pim1.write(fileDesc, `${JSON.stringify(transformedFamily)}\n`);
                transformedFamiliesMap.set(transformedFamily.code, transformedFamily);
            }
        }
        yield pim1.close(fileDesc);
        return transformedFamiliesMap.size;
    });
}
exports.transformFamilies = transformFamilies;
// Don't import categories
// Swap sku with vendor_sku
// Swap admin_sku with sku
// delete complete, sku'd and synced product from VP
// search={"enabled":[{"operator":"=","value":true}],"completeness":[{"operator":"=","value":100,"scope":"ecommerce"}]}
function transformProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        const methodName = 'transformProducts';
        logger.info({ moduleName, methodName }, 'Starting...');
        let results = 0;
        const fileName = path.join(pim2.exportPath, pim2.filenameProducts);
        let fileDesc = yield pim2.open(fileName, 'r');
        const buffer = (yield pim2.read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
        yield pim2.close(fileDesc);
        yield rename(fileName, `${fileName}.${now()}`);
        fileDesc = yield pim2.open(fileName, 'w');
        if (buffer.length > 0) {
            const products = JSON.parse(`[ ${buffer} ]`);
            for (const product of products) {
                const admin_sku = product.values &&
                    product.values.admin_sku &&
                    product.values.admin_sku[0] ?
                    product.values.admin_sku[0].data : '';
                if (admin_sku) {
                    // build the destination (pim1) product swaping skus
                    const vendor_sku = product.identifier;
                    const transformedProduct = {
                        identifier: admin_sku,
                        family: product.family,
                        values: product.values
                    };
                    delete product.values.admin_sku;
                    product.values.vendor_sku = [{ locale: null, scope: null, data: vendor_sku }];
                    // add the product to pim1
                    const pim1PatchResults = yield pim1.patch(pim1.apiUrlProducts(admin_sku), transformedProduct);
                    logger.info({ moduleName, methodName, pim1PatchResults });
                    if (pim1PatchResults &&
                        pim1PatchResults.statusCode < 300) {
                        // verify the product is in pim1
                        const pim1GetResults = yield pim1.get(pim1.apiUrlProducts(admin_sku));
                        logger.info({ moduleName, methodName, pim1GetResults });
                        if (pim1GetResults &&
                            pim1GetResults[0] &&
                            pim1GetResults[0].statusCode === 200 &&
                            pim1GetResults[0].values) {
                            const pim1Values = pim1GetResults[0].values;
                            const pim2Values = transformedProduct.values;
                            let verified = true;
                            for (const pim2Value in pim2Values) {
                                const pim1Data = pim1Values[pim2Value][0].data;
                                const pim2Data = pim2Values[pim2Value][0].data;
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
                                const pim2DeleteResults = yield pim2.delete_(pim2.apiUrlProducts(vendor_sku), {});
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
    });
}
// Start the program
if (require.main === module) {
    main();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLHlCQUF5QjtBQUN6Qix3Q0FBd0M7QUFDeEMsb0RBQW9EO0FBQ3BELEtBQUssTUFBTSxRQUFRLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtJQUNwQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUM5QyxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0IsTUFBTTtLQUNQO0NBQ0Y7QUFDRCx3Q0FBd0M7QUFDeEMsZUFBZTtBQUNmLDZCQUE2QjtBQUM3Qiw2QkFBNkI7QUFHN0IsTUFBTSxVQUFVLEdBQVcsb0JBQW9CLENBQUM7QUFFaEQsSUFBSSxNQUFNLEdBQVcsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0FBQy9ELG1CQUEwQixRQUFnQjtJQUN4QyxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQ3BCLENBQUM7QUFGRCw4QkFFQztBQUVELHNCQUE0QixRQUFnQixFQUFFLElBQVM7O1FBQ3JELE1BQU0sVUFBVSxHQUFXLGNBQWMsQ0FBQztRQUMxQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFFdkUsSUFBSSxPQUFPLEdBQVcsQ0FBQyxDQUFDO1FBRXhCLE1BQU0sT0FBTyxHQUFxQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sT0FBTyxHQUFxQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXJFLE1BQU0sUUFBUSxHQUFXLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzlGLEtBQUssTUFBTSxHQUFHLElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ2hDLE1BQU0sT0FBTyxHQUFRLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEMsTUFBTSxPQUFPLEdBQVEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0JBQ1YsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRTtnQkFDN0IsRUFBRSxPQUFPLENBQUM7Z0JBQ1YsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzVEO1NBQ0Y7UUFDRCxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFM0IsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztDQUFBO0FBRUQsaUJBQWlCLEdBQVEsRUFBRSxRQUFnQixDQUFDO0lBQzFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7QUFDcEQsQ0FBQztBQUVELGNBQW9CLEdBQUcsSUFBYzs7UUFDbkMsTUFBTSxVQUFVLEdBQVcsTUFBTSxDQUFDO1FBQ2xDLE1BQU0sV0FBVyxHQUFTLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBb0IsSUFBSSxNQUFNLENBQUM7UUFDckUsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQixNQUFNLE9BQU8sR0FBUyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxFQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRWhFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFdkIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUErQixJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxXQUFXLENBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBZ0MsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsYUFBYSxDQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQWtDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLFdBQVcsQ0FBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUErQixJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxTQUFTLENBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBNkIsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsV0FBVyxDQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQStCLElBQUksRUFBRSxDQUFDLENBQUM7UUFFckUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV2QixJQUFJLENBQUMsVUFBVSxDQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQStCLElBQUksRUFBRSxDQUFDLENBQUM7UUFDcEUsSUFBSSxDQUFDLFdBQVcsQ0FBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFnQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxhQUFhLENBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBa0MsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsV0FBVyxDQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQStCLElBQUksRUFBRSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLFNBQVMsQ0FBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUE2QixJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxXQUFXLENBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBK0IsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUVyRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztRQUNwRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBRS9ELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFFL0QsSUFBSSxPQUFPLEdBQVEsSUFBSSxDQUFDO1FBRXhCLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDMUIsSUFBSSxDQUFDLHNCQUFzQixFQUFFO1lBQzdCLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtZQUM1QixJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDdkIsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNyQixJQUFJLENBQUMsY0FBYyxFQUFFO1lBRXJCLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtZQUM3QixJQUFJLENBQUMscUJBQXFCLEVBQUU7WUFDNUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQ3ZCLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDckIsSUFBSSxDQUFDLGNBQWMsRUFBRTtTQUV0QixDQUFDLENBQUM7UUFFSCxNQUFNLFFBQVEsR0FBUSxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVTtZQUN4RCw0Q0FBNEM7WUFDNUMsbUVBQW1FO1lBQ25FLEdBQUcsQ0FBQyxDQUFDO1FBRVAsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVsQixNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdkQsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7UUFDeEYsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEVBQ3pFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7UUFFeEcsTUFBTSx3QkFBd0IsR0FBcUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM3RCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLHdCQUF3QixFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRWxILE1BQU0sd0JBQXdCLEdBQXFCLElBQUksR0FBRyxFQUFFLENBQUM7UUFDN0QsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMseUJBQXlCLENBQUMsRUFBRSx3QkFBd0IsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNsSCxJQUFJLHdCQUF3QixDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7WUFDdkMsS0FBSyxNQUFNLEtBQUssSUFBSSx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDckQsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDO2dCQUNwQixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUM7YUFDckI7U0FDRjtRQUVELE1BQU0scUJBQXFCLEdBQVcsTUFBTSxtQkFBbUIsRUFBRSxDQUFDO1FBQ2xFLE1BQU0sMEJBQTBCLEdBQVcsTUFBTSx3QkFBd0IsRUFBRSxDQUFDO1FBQzVFLE1BQU0sbUJBQW1CLEdBQVcsTUFBTSxpQkFBaUIsRUFBRSxDQUFDO1FBRTlELE1BQU0sUUFBUSxHQUFXLE1BQU0sWUFBWSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMzRSxNQUFNLGdCQUFnQixHQUFXLE1BQU0sWUFBWSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMzRixNQUFNLGVBQWUsR0FBVyxNQUFNLFlBQVksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekYsTUFBTSxVQUFVLEdBQVcsTUFBTSxZQUFZLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQy9FLE1BQU0sZ0JBQWdCLEdBQVcsTUFBTSxZQUFZLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDMUcsTUFBTSxRQUFRLEdBQVcsTUFBTSxZQUFZLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdFLDJGQUEyRjtRQUUzRjs7Ozs7Ozs7Ozs7O1VBWUU7UUFFQSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWxCLE1BQU0sc0JBQXNCLEdBQVcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUV2RCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBRXpELE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDeEQsT0FBTyxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDeEUsT0FBTyxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3RFLE9BQU8sR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUM1RCxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN4RSxPQUFPLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzFELHdFQUF3RTtRQUV0RSxJQUFJLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFM0MsT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFdEQsTUFBTSxPQUFPLEdBQVMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNqQyxNQUFNLFFBQVEsR0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRyxNQUFNLFFBQVEsR0FBVyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoRixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBQyxZQUFZLENBQUMsQ0FBQztJQUM3RixDQUFDO0NBQUE7QUFFRDtJQUNFLE9BQU8sSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDekUsQ0FBQztBQUZELGtCQUVDO0FBRUQsZ0JBQXVCLE9BQWUsRUFBRSxPQUFlO0lBQ3JELE1BQU0sVUFBVSxHQUFXLFFBQVEsQ0FBQztJQUNwQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBWSxFQUFFLE1BQVcsRUFBRSxFQUFFO1FBQy9DLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ2xDLElBQUksR0FBRyxFQUFFO2dCQUNQLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM5RCxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNwQjtpQkFBTTtnQkFDTCxPQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNwQjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBWkQsd0JBWUM7QUFFRCxjQUFjLEdBQVEsRUFBRSxHQUFRO0lBQzlCLElBQUksR0FBRztRQUNILEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUNsQixPQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN2QjtJQUNELElBQUksR0FBRztRQUNILEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUNsQixPQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN2QjtJQUNELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO1FBQ2pELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQzNELENBQUM7QUFFRCw0QkFBNEIsSUFBWTtJQUN0QyxNQUFNLFVBQVUsR0FBVyxvQkFBb0IsQ0FBQztJQUNoRCx1RUFBdUU7SUFDdkUsTUFBTSxPQUFPLEdBQVEsRUFBRSxDQUFDO0lBQ3hCLE1BQU0saUJBQWlCLEdBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwRCxJQUFJLGlCQUFpQixLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQzVCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUNoRCxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMvRDtTQUFNO1FBQ0wsT0FBTyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDbEIsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7S0FDckI7SUFFRCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBRUQsa0NBQWtDO0FBQ2xDLGlDQUFpQztBQUNqQyx3Q0FBd0M7QUFDeEMsa0NBQWtDO0FBQ2xDLDRCQUE0QjtBQUM1QixvQ0FBb0M7QUFDcEMscUNBQXFDO0FBQ3JDLE1BQU0sd0JBQXdCLEdBQXFCLElBQUksR0FBRyxFQUFFLENBQUM7QUFDN0Q7O1FBQ0UsTUFBTSxVQUFVLEdBQVcscUJBQXFCLENBQUM7UUFDakQsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUV2RCxNQUFNLFFBQVEsR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDN0UsSUFBSSxRQUFRLEdBQVcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0RCxNQUFNLE1BQU0sR0FBVyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQixNQUFNLE1BQU0sQ0FBQyxRQUFRLEVBQUUsR0FBRyxRQUFRLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQy9DLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzFDLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDckIsTUFBTSxVQUFVLEdBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLE1BQU0sSUFBSSxDQUFDLENBQUM7WUFDdEQsd0ZBQXdGO1lBQ3hGLEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxFQUFFO2dCQUNsQyxPQUFPLFNBQVMsQ0FBQyxZQUFZLENBQUM7YUFDL0I7WUFDRCxNQUFNLHFCQUFxQixHQUFVLEVBQUUsQ0FBQztZQUN4QyxLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRTtnQkFDbEMsSUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLLEtBQUs7b0JBQ3hCLFNBQVMsQ0FBQyxJQUFJLEtBQUssWUFBWTtvQkFDL0IsU0FBUyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsa0NBQWtDO29CQUMxRCxTQUFTLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyw0QkFBNEI7b0JBQ3BELFNBQVMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLHNCQUFzQjtvQkFDOUMsU0FBUyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsOEJBQThCO29CQUN0RCxTQUFTLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQywrQkFBK0IsRUFBRTtvQkFDM0QsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM3RCx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztpQkFDekQ7YUFDRjtTQUNGO1FBQ0QsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTNCLE9BQU8sd0JBQXdCLENBQUMsSUFBSSxDQUFDO0lBQ3ZDLENBQUM7Q0FBQTtBQWpDRCxrREFpQ0M7QUFFRCxNQUFNLDZCQUE2QixHQUFxQixJQUFJLEdBQUcsRUFBRSxDQUFDO0FBRWxFLHFDQUFxQztBQUNyQzs7UUFDRSxNQUFNLFVBQVUsR0FBVywwQkFBMEIsQ0FBQztRQUN0RCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRXZELE1BQU0sUUFBUSxHQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUNsRixJQUFJLFFBQVEsR0FBVyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sTUFBTSxHQUFXLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNCLE1BQU0sTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLFFBQVEsSUFBSSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDL0MsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDMUMsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNyQixNQUFNLGVBQWUsR0FBVSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsQ0FBQztZQUMzRCx3Q0FBd0M7WUFDeEMsNENBQTRDO1lBQzVDLG9DQUFvQztZQUNwQyxLQUFLLE1BQU0sY0FBYyxJQUFJLGVBQWUsRUFBRTtnQkFDNUMsY0FBYyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7YUFDaEM7WUFDRCxLQUFLLE1BQU0sY0FBYyxJQUFJLGVBQWUsRUFBRTtnQkFDNUMsSUFBSSxjQUFjLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRTtvQkFDbkMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNsRSw2QkFBNkIsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztpQkFDeEU7YUFDRjtTQUNGO1FBQ0QsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTNCLE9BQU8sNkJBQTZCLENBQUMsSUFBSSxDQUFDO0lBQzVDLENBQUM7Q0FBQTtBQTVCRCw0REE0QkM7QUFFRCxNQUFNLHNCQUFzQixHQUFxQixJQUFJLEdBQUcsRUFBRSxDQUFDO0FBRTNELG1DQUFtQztBQUNuQyxtQ0FBbUM7QUFDbkM7O1FBQ0UsTUFBTSxVQUFVLEdBQVcsbUJBQW1CLENBQUM7UUFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUV2RCxNQUFNLFlBQVksR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDL0UsTUFBTSxlQUFlLEdBQXFCLElBQUksR0FBRyxFQUFFLENBQUM7UUFDcEQsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFdkQsTUFBTSxRQUFRLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzNFLElBQUksUUFBUSxHQUFXLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEQsTUFBTSxNQUFNLEdBQVcsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0IsTUFBTSxNQUFNLENBQUMsUUFBUSxFQUFFLEdBQUcsUUFBUSxJQUFJLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMvQyxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMxQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3JCLE1BQU0sUUFBUSxHQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxNQUFNLElBQUksQ0FBQyxDQUFDO1lBQ3BELEtBQUssTUFBTSxNQUFNLElBQUksUUFBUSxFQUFFO2dCQUM3QixNQUFNLGlCQUFpQixHQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLGNBQWMsR0FBVSxpQkFBaUIsQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDO2dCQUMvRCxJQUFJLHlCQUF5QixHQUFVLENBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBRSxDQUFDO2dCQUM5RCxLQUFLLE1BQU0sYUFBYSxJQUFJLGNBQWMsRUFBRTtvQkFDMUMsTUFBTSxTQUFTLEdBQVEsd0JBQXdCLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUNuRSxJQUFJLFNBQVMsRUFBRTt3QkFDYix5QkFBeUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFBO3FCQUMvQztpQkFDRjtnQkFDRCxpQkFBaUIsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFNUYsTUFBTSxVQUFVLEdBQVEsZUFBZSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pELElBQUksVUFBVSxFQUFFO29CQUNkLGlCQUFpQixDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO2lCQUMxRztnQkFFRCxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckUsc0JBQXNCLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO2FBQ3ZFO1NBQ0Y7UUFDRCxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFM0IsT0FBTyxzQkFBc0IsQ0FBQyxJQUFJLENBQUM7SUFDckMsQ0FBQztDQUFBO0FBeENELDhDQXdDQztBQUVELDBCQUEwQjtBQUMxQiwyQkFBMkI7QUFDM0IsMEJBQTBCO0FBQzFCLG9EQUFvRDtBQUNwRCx1SEFBdUg7QUFDdkg7O1FBQ0UsTUFBTSxVQUFVLEdBQVcsbUJBQW1CLENBQUM7UUFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUV2RCxJQUFJLE9BQU8sR0FBVyxDQUFDLENBQUM7UUFFeEIsTUFBTSxRQUFRLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzNFLElBQUksUUFBUSxHQUFXLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEQsTUFBTSxNQUFNLEdBQVcsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0IsTUFBTSxNQUFNLENBQUMsUUFBUSxFQUFFLEdBQUcsUUFBUSxJQUFJLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMvQyxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMxQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3JCLE1BQU0sUUFBUSxHQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxNQUFNLElBQUksQ0FBQyxDQUFDO1lBQ3BELEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFO2dCQUM5QixNQUFNLFNBQVMsR0FDYixPQUFPLENBQUMsTUFBTTtvQkFDZCxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVM7b0JBQ3hCLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUN4QyxJQUFJLFNBQVMsRUFBRTtvQkFDYixvREFBb0Q7b0JBQ3BELE1BQU0sVUFBVSxHQUFXLE9BQU8sQ0FBQyxVQUFVLENBQUM7b0JBQzlDLE1BQU0sa0JBQWtCLEdBQVE7d0JBQzlCLFVBQVUsRUFBRSxTQUFTO3dCQUNyQixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07d0JBQ3RCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtxQkFDdkIsQ0FBQztvQkFDRixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO29CQUNoQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBRSxDQUFDO29CQUNoRiwwQkFBMEI7b0JBQzFCLE1BQU0sZ0JBQWdCLEdBQVEsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztvQkFDbkcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO29CQUMxRCxJQUFJLGdCQUFnQjt3QkFDaEIsZ0JBQWdCLENBQUMsVUFBVSxHQUFHLEdBQUcsRUFBRTt3QkFDckMsZ0NBQWdDO3dCQUNoQyxNQUFNLGNBQWMsR0FBUSxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO3dCQUMzRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO3dCQUN4RCxJQUFJLGNBQWM7NEJBQ2QsY0FBYyxDQUFDLENBQUMsQ0FBQzs0QkFDakIsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsS0FBSyxHQUFHOzRCQUNwQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFOzRCQUM1QixNQUFNLFVBQVUsR0FBUSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDOzRCQUNqRCxNQUFNLFVBQVUsR0FBUSxrQkFBa0IsQ0FBQyxNQUFNLENBQUM7NEJBQ2xELElBQUksUUFBUSxHQUFZLElBQUksQ0FBQzs0QkFDN0IsS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUU7Z0NBQ2xDLE1BQU0sUUFBUSxHQUFRLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0NBQ3BELE1BQU0sUUFBUSxHQUFRLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0NBQ3BELElBQUksUUFBUSxZQUFZLEtBQUssRUFBRTtvQ0FDN0IsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2lDQUNqQjtnQ0FDRCxJQUFJLFFBQVEsWUFBWSxLQUFLLEVBQUU7b0NBQzdCLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQ0FDakI7Z0NBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUU7b0NBQ3pELFFBQVEsR0FBRyxLQUFLLENBQUM7aUNBQ2xCOzZCQUNGOzRCQUNELElBQUksUUFBUSxFQUFFO2dDQUNaLCtCQUErQjtnQ0FDL0IsTUFBTSxpQkFBaUIsR0FBUSxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQ0FDdkYsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO2dDQUMzRCxJQUFJLGlCQUFpQjtvQ0FDakIsaUJBQWlCLENBQUMsVUFBVSxLQUFLLEdBQUcsRUFBRTtvQ0FDeEMsRUFBRSxPQUFPLENBQUM7aUNBQ1g7NkJBQ0Y7eUJBQ0Y7cUJBQ0Y7aUJBQ0Y7YUFDRjtTQUNGO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztDQUFBO0FBRUQsb0JBQW9CO0FBQ3BCLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7SUFDM0IsSUFBSSxFQUFFLENBQUM7Q0FDUiJ9