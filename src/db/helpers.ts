import _ from 'lodash';
import crypto from 'crypto';
import { Product, Price } from './types';

export function generateProductHash(product: Product): string {
  let hashFields: string[];
  // keep AWS product hashes the same so Infracost tests don't break
  if (product.vendorName === 'aws') {
    hashFields = ['vendorName', 'sku'];
  } else {
    hashFields = ['vendorName', 'region', 'sku'];
  }

  const hashableValues = _.values(_.pick(product, hashFields));
  return crypto
    .createHash('md5')
    .update(hashableValues.join('-'))
    .digest('hex');
}

export function generatePriceHash(product: Product, price: Price): string {
  let hashFields: string[];
  // keep AWS price hashes the same so Infracost tests don't break
  if (product.vendorName === 'aws') {
    hashFields = [
      'purchaseOption',
      'unit',
      'termLength',
      'termPurchaseOption',
      'termOfferingClass',
    ];
  } else {
    hashFields = [
      'purchaseOption',
      'unit',
      'startUsageAmount',
      'endUsageAmount',
      'termLength',
      'termPurchaseOption',
      'termOfferingClass',
    ];
  }

  const hashableValues = _.values(_.pick(price, hashFields));

  const hash = crypto
    .createHash('md5')
    .update(hashableValues.join('-'))
    .digest('hex');
  return `${product.productHash}-${hash}`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export function camelKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => camelKeys(v));
  }
  if (_.isPlainObject(obj)) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [_.camelCase(key)]: camelKeys(obj[key]),
      }),
      {}
    );
  }
  return obj;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
