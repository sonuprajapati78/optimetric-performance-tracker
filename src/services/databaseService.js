/**
 * Database Service
 * Responsibility: ONLY database operations
 * - Insert/Upsert records
 * - Delete records
 * - Query records
 * - No business logic, only CRUD operations
 */

const Agent = require('../models/Agent');
const UploadHistory = require('../models/UploadHistory');
const logger = require('../utils/logger');

/**
 * Upsert agent performance records
 * @param {Array} records - Performance records to upsert
 * @param {Date} dataDate - Date for the records
 * @returns {object} Upsert result {inserted, updated, failed}
 */
async function upsertAgentRecords(records, dataDate) {
  const result = {
    inserted: 0,
    updated: 0,
    failed: 0,
    errors: [],
  };

  try {
    for (const record of records) {
      try {
        const updateResult = await Agent.findOneAndUpdate(
          {
            name: record.name,
            date: new Date(dataDate),
          },
          {
            name: record.name,
            date: new Date(dataDate),
            talkTime: record.talkTime,
            loggedInTime: record.loggedInTime,
            breakTime: record.breakTime,
            performanceScore: record.performanceScore,
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );

        if (updateResult._id && updateResult.isNew !== false) {
          result.inserted++;
        } else {
          result.updated++;
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          agentName: record.name,
          error: error.message,
        });
        logger.error('Failed to upsert agent record', {
          agentName: record.name,
          error: error.message,
        });
      }
    }

    logger.info('Agent records upsert completed', result);
    return result;
  } catch (error) {
    logger.error('Upsert operation failed', { error: error.message });
    throw error;
  }
}

/**
 * Delete agent records by date range
 * @param {Date} startDate - Start date (inclusive)
 * @param {Date} endDate - End date (exclusive)
 * @returns {object} Delete result {deletedCount}
 */
async function deleteAgentRecordsByDate(startDate, endDate) {
  try {
    const result = await Agent.deleteMany({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    logger.warn('Agent records deleted by date range', {
      startDate,
      endDate,
      deletedCount: result.deletedCount,
    });

    return {
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    logger.error('Delete by date failed', { error: error.message });
    throw error;
  }
}

/**
 * Delete all agent records
 * @returns {object} Delete result {deletedCount}
 */
async function deleteAllAgentRecords() {
  try {
    const result = await Agent.deleteMany({});

    logger.error('ALL AGENT RECORDS DELETED', {
      deletedCount: result.deletedCount,
    });

    return {
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    logger.error('Delete all records failed', { error: error.message });
    throw error;
  }
}

/**
 * Save upload history record
 * @param {object} historyData - Upload history data
 * @returns {object} Saved history record
 */
async function saveUploadHistory(historyData) {
  try {
    const history = new UploadHistory(historyData);
    const saved = await history.save();

    logger.info('Upload history saved', {
      uploadId: saved._id,
      fileName: saved.fileName,
      status: saved.status,
    });

    return saved;
  } catch (error) {
    logger.error('Failed to save upload history', { error: error.message });
    throw error;
  }
}

/**
 * Get upload history with pagination
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Records per page
 * @param {string} status - Filter by status (optional)
 * @returns {object} Paginated history
 */
async function getUploadHistory(page = 1, limit = 20, status = null) {
  try {
    const skip = (page - 1) * limit;
    const query = status ? { status } : {};

    const records = await UploadHistory.find(query)
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await UploadHistory.countDocuments(query);

    logger.info('Upload history retrieved', {
      page,
      limit,
      total,
      returned: records.length,
    });

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Failed to get upload history', { error: error.message });
    throw error;
  }
}

module.exports = {
  upsertAgentRecords,
  deleteAgentRecordsByDate,
  deleteAllAgentRecords,
  saveUploadHistory,
  getUploadHistory,
};
