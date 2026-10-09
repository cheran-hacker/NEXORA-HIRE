import { StudyRoom } from '../models/StudyRoom.js';
import { RoomBid } from '../models/RoomBid.js';
import { User } from '../models/User.js';

export const getActiveAuctions = async (req, res) => {
  try {
    const rooms = await StudyRoom.find();
    
    // For each room, get the highest leading bid
    const auctions = await Promise.all(rooms.map(async (room) => {
      // Find highest bid for this room
      const topBid = await RoomBid.findOne({ room: room._id, status: 'Leading' })
        .sort({ bidAmount: -1 })
        .populate('student', 'name avatarUrl');
        
      return {
        id: room._id,
        roomName: room.roomName,
        capacity: room.capacity,
        basePriceKarma: room.basePriceKarma,
        currentBid: topBid ? topBid.bidAmount : room.basePriceKarma,
        topBidder: topBid ? topBid.student : null,
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // Mock ending tomorrow
      };
    }));

    res.json({ success: true, data: auctions });
  } catch (error) {
    console.error('Error in getActiveAuctions:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getBidsForRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const bids = await RoomBid.find({ room: roomId })
      .populate('student', 'name avatarUrl')
      .sort({ bidAmount: -1 })
      .limit(10);
      
    res.json({ success: true, data: bids });
  } catch (error) {
    console.error('Error in getBidsForRoom:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const placeBid = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { roomId, bidAmount, timeSlot } = req.body;

    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if user has enough Karma
    const studentProfile = user.studentProfile || {};
    const karma = studentProfile.karmaPoints || 500; // Mock 500 default karma if missing
    
    if (karma < bidAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient Karma Points' });
    }

    const room = await StudyRoom.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    if (bidAmount < room.basePriceKarma) {
      return res.status(400).json({ success: false, message: 'Bid amount is below base price' });
    }

    // Find current leading bid
    const currentLeading = await RoomBid.findOne({ room: roomId, status: 'Leading', timeSlot });
    
    if (currentLeading && bidAmount <= currentLeading.bidAmount) {
      return res.status(400).json({ success: false, message: 'Bid must be higher than current leading bid' });
    }

    // Process the bid - we update the outbid student in reality and maybe refund their karma, but keeping it simple
    if (currentLeading) {
      currentLeading.status = 'Outbid';
      await currentLeading.save();
      
      // Optionally refund karma to outbid user here...
      const outbidUser = await User.findById(currentLeading.student);
      if (outbidUser && outbidUser.studentProfile) {
        outbidUser.studentProfile.karmaPoints = (outbidUser.studentProfile.karmaPoints || 0) + currentLeading.bidAmount;
        await outbidUser.save();
      }
    }

    // Deduct karma from new bidder
    user.studentProfile.karmaPoints = karma - bidAmount;
    await user.save();

    // Create new bid
    const newBid = await RoomBid.create({
      room: roomId,
      student: studentId,
      bidAmount,
      timeSlot,
      status: 'Leading'
    });

    res.json({ success: true, data: newBid, message: 'Bid placed successfully!' });
  } catch (error) {
    console.error('Error in placeBid:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getMyBids = async (req, res) => {
  try {
    const studentId = req.user.id;
    const bids = await RoomBid.find({ student: studentId })
      .populate('room', 'roomName capacity')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: bids });
  } catch (error) {
    console.error('Error in getMyBids:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
