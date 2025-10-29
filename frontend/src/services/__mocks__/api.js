const get = jest.fn();
const post = jest.fn();
const patch = jest.fn();

const api = {
  get,
  post,
  patch,
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

module.exports = api;
module.exports.get = get;
module.exports.post = post;
module.exports.patch = patch;
