export type Category = {
  id: string;
  label: string;
  group: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
};

const P = "This certificate is proudly presented to";

export const CATEGORIES: Category[] = [
  { id: "participation", group: "Participation", label: "Participation", badge: "Participant", title: "Certificate of Participation", subtitle: P, description: "for active participation in" },
  { id: "attendance", group: "Participation", label: "Attendance", badge: "Attended", title: "Certificate of Attendance", subtitle: "This is to certify that", description: "has successfully attended" },
  { id: "workshop", group: "Participation", label: "Workshop Completion", badge: "Completed", title: "Certificate of Completion", subtitle: "This is to certify that", description: "has successfully completed the workshop" },
  { id: "winner1", group: "Winners", label: "1st Place", badge: "1st", title: "Certificate of Achievement", subtitle: P, description: "for securing First Place in" },
  { id: "winner2", group: "Winners", label: "2nd Place", badge: "2nd", title: "Certificate of Achievement", subtitle: P, description: "for securing Second Place in" },
  { id: "winner3", group: "Winners", label: "3rd Place", badge: "3rd", title: "Certificate of Achievement", subtitle: P, description: "for securing Third Place in" },
  { id: "excellence", group: "Winners", label: "Excellence", badge: "Excellence", title: "Certificate of Excellence", subtitle: P, description: "for outstanding excellence in" },
  { id: "bestproject", group: "Winners", label: "Best Project", badge: "Best", title: "Best Project Award", subtitle: P, description: "for building the most outstanding project at" },
  { id: "special", group: "Winners", label: "Special Mention", badge: "Special", title: "Special Mention", subtitle: P, description: "for remarkable innovation and creativity at" },
  { id: "volunteer", group: "Contributors", label: "Volunteer", badge: "Volunteer", title: "Certificate of Appreciation", subtitle: "With sincere gratitude to", description: "for dedicated volunteering at" },
  { id: "organizer", group: "Contributors", label: "Organizing Team", badge: "Organizer", title: "Certificate of Recognition", subtitle: "In recognition of the efforts of", description: "as a core organizing team member of" },
  { id: "coordinator", group: "Contributors", label: "Coordinator", badge: "Lead", title: "Certificate of Leadership", subtitle: "In recognition of the leadership of", description: "for coordinating" },
  { id: "speaker", group: "Guests", label: "Speaker", badge: "Speaker", title: "Certificate of Appreciation", subtitle: "With heartfelt thanks to", description: "for delivering an inspiring session at" },
  { id: "mentor", group: "Guests", label: "Mentor", badge: "Mentor", title: "Certificate of Mentorship", subtitle: "With heartfelt thanks to", description: "for guiding and mentoring participants at" },
  { id: "judge", group: "Guests", label: "Judge", badge: "Judge", title: "Certificate of Honour", subtitle: "With heartfelt thanks to", description: "for serving on the judging panel of" },
  { id: "internship", group: "Professional", label: "Internship", badge: "Intern", title: "Internship Certificate", subtitle: "This is to certify that", description: "has successfully completed an internship with" },
  { id: "finalist", group: "Winners", label: "Hackathon Finalist", badge: "Finalist", title: "Certificate of Merit", subtitle: P, description: "for reaching the Grand Finale of" },
  { id: "uiux", group: "Winners", label: "Best UI/UX", badge: "Best UX", title: "Best Design Award", subtitle: P, description: "for the most delightful user experience at" },
  { id: "peoples", group: "Winners", label: "People's Choice", badge: "Choice", title: "People's Choice Award", subtitle: P, description: "for winning the hearts of the audience at" },
  { id: "innovative", group: "Winners", label: "Most Innovative", badge: "Innovate", title: "Innovation Award", subtitle: P, description: "for the most innovative solution at" },
  { id: "quiz", group: "Competitions", label: "Quiz Winner", badge: "Quiz", title: "Certificate of Achievement", subtitle: P, description: "for winning the quiz competition at" },
  { id: "paper", group: "Competitions", label: "Paper Presentation", badge: "Paper", title: "Certificate of Presentation", subtitle: "This is to certify that", description: "has presented a research paper at" },
  { id: "poster", group: "Competitions", label: "Poster Presentation", badge: "Poster", title: "Certificate of Presentation", subtitle: "This is to certify that", description: "has presented a poster at" },
  { id: "gold", group: "Sports & Culture", label: "Sports Gold", badge: "Gold", title: "Certificate of Victory", subtitle: P, description: "for winning the Gold Medal at" },
  { id: "silver", group: "Sports & Culture", label: "Sports Silver", badge: "Silver", title: "Certificate of Victory", subtitle: P, description: "for winning the Silver Medal at" },
  { id: "bronze", group: "Sports & Culture", label: "Sports Bronze", badge: "Bronze", title: "Certificate of Victory", subtitle: P, description: "for winning the Bronze Medal at" },
  { id: "cultural", group: "Sports & Culture", label: "Cultural Performance", badge: "Star", title: "Certificate of Performance", subtitle: P, description: "for a spectacular performance at" },
  { id: "member", group: "Contributors", label: "Club Membership", badge: "Member", title: "Certificate of Membership", subtitle: "This certifies that", description: "is a proud member of" },
  { id: "ambassador", group: "Contributors", label: "Campus Ambassador", badge: "Ambassador", title: "Certificate of Recognition", subtitle: "In recognition of", description: "for serving as Campus Ambassador for" },
  { id: "course", group: "Professional", label: "Course Completion", badge: "Verified", title: "Course Certificate", subtitle: "This is to certify that", description: "has successfully completed the online course" },
  { id: "training", group: "Professional", label: "Training", badge: "Trained", title: "Certificate of Training", subtitle: "This is to certify that", description: "has successfully completed training in" },
  { id: "scholarship", group: "Professional", label: "Scholarship", badge: "Scholar", title: "Scholarship Award", subtitle: "Awarded to", description: "in recognition of academic merit at" },
  { id: "employee", group: "Professional", label: "Employee of the Month", badge: "Star", title: "Employee of the Month", subtitle: "Proudly awarded to", description: "for exceptional dedication and performance at" },
  { id: "recommendation", group: "Professional", label: "Recommendation", badge: "Endorsed", title: "Letter of Recommendation", subtitle: "We highly recommend", description: "for excellent work and conduct during" },
  { id: "custom", group: "Professional", label: "Custom", badge: "Award", title: "Certificate", subtitle: P, description: "for" },
];
