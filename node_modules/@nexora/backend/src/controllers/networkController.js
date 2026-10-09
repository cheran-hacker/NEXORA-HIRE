import { ConnectionNode } from '../models/ConnectionNode.js';
import { User } from '../models/User.js';

export const getNetworkPath = async (req, res, next) => {
  try {
    const { company } = req.query;
    
    // 1. Find Alumni working at this company
    const targets = await ConnectionNode.find({ company: { $regex: new RegExp(company, 'i') } })
      .populate('user', 'name role email');
      
    if (targets.length === 0) {
      return res.status(404).json({ message: 'No alumni found at this company.' });
    }

    // 2. Find Faculty (our "connectors")
    const faculties = await User.find({ role: 'Faculty' });

    // 3. For MVP simulation: build a dummy path
    // In a real app with Neo4j or complex MongoDB aggregation, we'd do a shortest-path algorithm.
    // For this prototype, we'll simulate a 3-hop path: Student -> Random Faculty -> Alumni at Company
    
    const targetAlumni = targets[0].user;
    const connectorFaculty = faculties.length > 0 ? faculties[0] : null;

    let path = [];
    
    path.push({
      _id: req.user.id,
      name: 'You',
      role: 'Student'
    });

    if (connectorFaculty) {
      path.push({
        _id: connectorFaculty._id,
        name: connectorFaculty.name,
        role: 'Faculty',
        connectionType: 'Professor'
      });
    }

    path.push({
      _id: targetAlumni._id,
      name: targetAlumni.name,
      role: 'Alumni',
      company: company,
      connectionType: 'Former Student'
    });

    res.status(200).json({ success: true, data: { path } });
  } catch (error) {
    next(error);
  }
};
