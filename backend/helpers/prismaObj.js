const quizSelect = {
  id: true,
  title: true,
  description: true,
  duration: true,
  image: true,
  endDate: true,
  bonusesList: true,
  questions: {
    select: {
      id: true,
      name: true,
      type: true,
      tooltip: true,
      maxPoints: true,
    },
  },
  authorId: true,
  createdAt: true,
  private: true,
  allowed: true,
  active: true,
  play: true
};

module.exports = { quizSelect };
