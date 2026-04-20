/**
 * Performance Service - Production
 * 
 * Responsibility: Database operations
 * - Query agents
 * - Save agents
 * - Delete records
 * - Database-specific logic only
 */

const Agent = require('../models/Agent');
const logger = require('../utils/logger');

/**
 * Get top performers
 */
async function getTopPerformers(limit = 5) {
  try {
    const performers = await Agent.find()
      .sort({ performanceScore: -1, date: -1 })
      .limit(limit)
      .lean()
      .exec();

    return performers;
  } catch (error) {
    logger.error('Error fetching top performers', { error: error.message });
    throw error;
  }
}

/**
 * Get total agent count
 */
async function getTotalAgentCount() {
  try {
    const count = await Agent.countDocuments();
    return count;
  } catch (error) {
    logger.error('Error counting agents', { error: error.message });
    throw error;
  }
}

/**
 * Save agent record
 */
async function saveAgent(agentData) {
  try {
    const agent = new Agent(agentData);
    const saved = await agent.save();
    return saved;
  } catch (error) {
    logger.error('Error saving agent', {
      agentName: agentData.name,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Save multiple agents in batch
 */
async function saveAgentsBatch(agentDataArray) {
  try {
    const result = await Agent.insertMany(agentDataArray, { ordered: false });
    return result;
  } catch (error) {
    logger.error('Error batch saving agents', { error: error.message });
    throw error;
  }
}

/**
 * Delete all agents
 */
async function deleteAllAgents() {
  try {
    const result = await Agent.deleteMany({});
    return result;
  } catch (error) {
    logger.error('Error deleting all agents', { error: error.message });
    throw error;
  }
}

/**
 * Get agent by name
 */
async function getAgentByName(name) {
  try {
    const agent = await Agent.findOne({ name }).lean();
    return agent;
  } catch (error) {
    logger.error('Error fetching agent by name', { error: error.message });
    throw error;
  }
}

/**
 * Get agents by date range
 */
async function getAgentsByDateRange(startDate, endDate) {
  try {
    const agents = await Agent.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ performanceScore: -1 })
      .lean()
      .exec();

    return agents;
  } catch (error) {
    logger.error('Error fetching agents by date range', { error: error.message });
    throw error;
  }
}

module.exports = {
  getTopPerformers,
  getTotalAgentCount,
  saveAgent,
  saveAgentsBatch,
  deleteAllAgents,
  getAgentByName,
  getAgentsByDateRange,
};
