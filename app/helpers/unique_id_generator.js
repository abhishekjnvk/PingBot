'use strict';

const nanoid = require('nanoid/async');

const ITEM_ALPHABET='0123456789';
const ITEM_ID_LENGTH=12;
const OTP_LENGTH=6;
const SHORT_ID_LENGTH=6;
const BATCH_SIZE_REQ=20;


const { customAlphabet } = nanoid;
const nid = customAlphabet(ITEM_ALPHABET, ITEM_ID_LENGTH);
const otpId = customAlphabet(ITEM_ALPHABET.substring(1), OTP_LENGTH);

const getUserId = async () => await nid();

const getId = async prefix => {
  const id = await nid();

  if (prefix) {
    return prefix + id;
  } else {
    return id;
  }
};

const getShortId = async prefix => {
  const id = await customAlphabet(ITEM_ALPHABET, SHORT_ID_LENGTH);

  if (prefix) {
    return prefix + (await id());
  } else {
    return await id();
  }
};


const getBulkIds = async (length, prefix = '') => {
  let promiseArr = [];
  const idArr = [];

  for (let i = 0; i < length; ++i) {
    promiseArr.push(nid());

    if (i % BATCH_SIZE_REQ === 0) {
      let ids = await Promise.allSettled(promiseArr);

      ids = ids.map(elem => `${prefix}${elem.value}`);
      idArr.push(...ids);
      promiseArr = [];
    }
  }

  if (promiseArr.length !== 0) {
    let ids = await Promise.allSettled(promiseArr);

    ids = ids.map(elem => `${prefix}${elem.value}`);
    idArr.push(...ids);
  }

  return idArr;
};

module.exports = {
  getUserId,
  getId,
  getShortId,
  getBulkIds,
};
