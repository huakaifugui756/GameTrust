/**
 * API版本控制中间件
 */

const semver = require('semver');

// 支持的API版本
const SUPPORTED_VERSIONS = ['1.0.0', '1.1.0', '1.2.0'];
const DEFAULT_VERSION = '1.2.0';
const DEPRECATED_VERSIONS = ['1.0.0'];

/**
 * 版本控制中间件
 * @param {Object} options - 配置选项
 * @param {string[]} options.supportedVersions - 支持的版本列表
 * @param {string} options.defaultVersion - 默认版本
 * @param {string[]} options.deprecatedVersions - 已弃用的版本列表
 * @param {boolean} options.allowQueryString - 是否允许通过查询字符串指定版本
 * @param {boolean} options.allowHeader - 是否允许通过请求头指定版本
 * @returns {Function} Express中间件
 */
function versionControl(options = {}) {
  const {
    supportedVersions = SUPPORTED_VERSIONS,
    defaultVersion = DEFAULT_VERSION,
    deprecatedVersions = DEPRECATED_VERSIONS,
    allowQueryString = true,
    allowHeader = true
  } = options;

  return (req, res, next) => {
    let version = null;

    // 尝试从查询字符串获取版本
    if (allowQueryString && req.query.version) {
      version = req.query.version;
    }

    // 尝试从请求头获取版本
    if (!version && allowHeader && req.get('API-Version')) {
      version = req.get('API-Version');
    }

    // 尝试从URL路径获取版本 (/api/v1/...)
    if (!version && req.path.match(/^\/api\/v(\d+)(?:\.(\d+)(?:\.(\d+))?)?/)) {
      const match = req.path.match(/^\/api\/v(\d+)(?:\.(\d+)(?:\.(\d+))?)?/);
      version = `${match[1]}.${match[2] || '0'}.${match[3] || '0'}`;
    }

    // 如果没有指定版本，使用默认版本
    if (!version) {
      version = defaultVersion;
    }

    // 确保版本格式正确
    if (!version.match(/^\d+\.\d+\.\d+$/)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_VERSION_FORMAT',
          message: '版本格式应为 x.y.z',
          details: {
            provided: version,
            expected: 'x.y.z'
          }
        }
      });
    }

    // 检查版本是否受支持
    if (!supportedVersions.includes(version)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UNSUPPORTED_VERSION',
          message: `不支持的API版本: ${version}`,
          details: {
            provided: version,
            supported: supportedVersions
          }
        }
      });
    }

    // 检查版本是否已弃用
    if (deprecatedVersions.includes(version)) {
      res.set({
        'X-API-Deprecated': 'true',
        'X-API-Sunset': new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90天后弃用
        'X-API-Alternative-Version': defaultVersion
      });
    }

    // 将版本信息添加到请求对象
    req.apiVersion = version;
    req.isDeprecatedVersion = deprecatedVersions.includes(version);

    // 添加版本信息到响应头
    res.set('API-Version', version);

    next();
  };
}

/**
 * 路由版本控制装饰器
 * @param {string} minVersion - 最低支持版本
 * @param {string} maxVersion - 最高支持版本
 * @returns {Function} 中间件函数
 */
function versionRange(minVersion, maxVersion) {
  return (req, res, next) => {
    const version = req.apiVersion;

    if (!version) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_VERSION',
          message: '请指定API版本'
        }
      });
    }

    // 检查最低版本
    if (minVersion && semver.lt(version, minVersion)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VERSION_TOO_LOW',
          message: `API版本过低，最低支持版本: ${minVersion}`,
          details: {
            current: version,
            required: minVersion
          }
        }
      });
    }

    // 检查最高版本
    if (maxVersion && semver.gt(version, maxVersion)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VERSION_TOO_HIGH',
          message: `API版本过高，最高支持版本: ${maxVersion}`,
          details: {
            current: version,
            required: maxVersion
          }
        }
      });
    }

    next();
  };
}

/**
 * 获取版本信息
 * @param {Object} options - 配置选项
 * @returns {Object} 版本信息
 */
function getVersionInfo(options = {}) {
  const {
    supportedVersions = SUPPORTED_VERSIONS,
    defaultVersion = DEFAULT_VERSION,
    deprecatedVersions = DEPRECATED_VERSIONS
  } = options;

  return {
    current: defaultVersion,
    supported: supportedVersions,
    deprecated: deprecatedVersions,
    latest: supportedVersions[supportedVersions.length - 1],
    schema: 'x.y.z'
  };
}

module.exports = {
  versionControl,
  versionRange,
  getVersionInfo,
  SUPPORTED_VERSIONS,
  DEFAULT_VERSION,
  DEPRECATED_VERSIONS
};