import mongoose from 'mongoose';

const eventSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Hackathon', 'Workshop', 'Seminar', 'Tournament', 'Meetup', 'Project', 'Game', 'Sport']
    },
    prize: { type: String },
    imageUrl: { type: String },
    organizer: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});

// Indexes for performance
eventSchema.index({ date: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ attendees: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
