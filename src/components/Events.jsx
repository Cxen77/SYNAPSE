import Cards from "./cards";
import Slider from "./Slider";

function Events() {
  const sampleEvent = [
    // Hackathon
    {
      organizerName: "Elon Musk",
      organizerTitle: "CEO, SpaceX",
      organizerAvatar:
        "https://upload.wikimedia.org/wikipedia/commons/e/ed/Elon_Musk_Royal_Society.jpg",
      eventImageUrl:
        "https://dorahacks.io/blog/content/images/2022/07/Solana-1.jpg",
      eventName: "Mars Tech Summit 2025",
      eventPrize: "$50,000",
      eventDescription:
        "A cutting-edge conference on space tech and interplanetary exploration.",
      category: "Hackathon",
    },
    {
      organizerName: "Elon Musk",
      organizerTitle: "CEO, SpaceX",
      organizerAvatar:
        "https://upload.wikimedia.org/wikipedia/commons/e/ed/Elon_Musk_Royal_Society.jpg",
      eventImageUrl:
        "https://dorahacks.io/blog/content/images/2022/07/Solana-1.jpg",
      eventName: "Mars Tech Summit 2025",
      eventPrize: "$50,000",
      eventDescription:
        "A cutting-edge conference on space tech and interplanetary exploration.",
      category: "Hackathon",
    },
    {
      organizerName: "Elon Musk",
      organizerTitle: "CEO, SpaceX",
      organizerAvatar:
        "https://upload.wikimedia.org/wikipedia/commons/e/ed/Elon_Musk_Royal_Society.jpg",
      eventImageUrl:
        "https://dorahacks.io/blog/content/images/2022/07/Solana-1.jpg",
      eventName: "Mars Tech Summit 2025",
      eventPrize: "$50,000",
      eventDescription:
        "A cutting-edge conference on space tech and interplanetary exploration.",
      category: "Hackathon",
    },
    // Game
    {
      organizerName: "Sheryl Sandberg",
      organizerTitle: "COO, Meta",
      organizerAvatar:
        "https://upload.wikimedia.org/wikipedia/commons/5/5b/Sheryl_Sandberg_%282018%29.jpg",
      eventImageUrl:
        "https://cdn.pixabay.com/photo/2016/09/07/17/37/laptop-1653722_1280.jpg",
      eventName: "Future of Social Media 2025",
      eventPrize: "$25,000",
      eventDescription:
        "Discussing the evolution of social platforms and digital communities.",
      category: "Game",
    },
    {
      organizerName: "Sheryl Sandberg",
      organizerTitle: "COO, Meta",
      organizerAvatar:
        "https://upload.wikimedia.org/wikipedia/commons/5/5b/Sheryl_Sandberg_%282018%29.jpg",
      eventImageUrl:
        "https://cdn.pixabay.com/photo/2016/09/07/17/37/laptop-1653722_1280.jpg",
      eventName: "Future of Social Media 2025",
      eventPrize: "$25,000",
      eventDescription:
        "Discussing the evolution of social platforms and digital communities.",
      category: "Game",
    },
    {
      organizerName: "Sheryl Sandberg",
      organizerTitle: "COO, Meta",
      organizerAvatar:
        "https://upload.wikimedia.org/wikipedia/commons/5/5b/Sheryl_Sandberg_%282018%29.jpg",
      eventImageUrl:
        "https://cdn.pixabay.com/photo/2016/09/07/17/37/laptop-1653722_1280.jpg",
      eventName: "Future of Social Media 2025",
      eventPrize: "$25,000",
      eventDescription:
        "Discussing the evolution of social platforms and digital communities.",
      category: "Game",
    },
    // Sport
    {
      organizerName: "Lionel Messi",
      organizerTitle: "Footballer",
      organizerAvatar:
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Lionel_Messi_20180626.jpg",
      eventImageUrl:
        "https://cdn.pixabay.com/photo/2017/05/15/17/57/football-2313165_1280.jpg",
      eventName: "Champions League Finals",
      eventPrize: "$100,000",
      eventDescription: "The biggest football event of the year.",
      category: "Sport",
    },
     {
      organizerName: "Lionel Messi",
      organizerTitle: "Footballer",
      organizerAvatar:
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Lionel_Messi_20180626.jpg",
      eventImageUrl:
        "https://cdn.pixabay.com/photo/2017/05/15/17/57/football-2313165_1280.jpg",
      eventName: "Champions League Finals",
      eventPrize: "$100,000",
      eventDescription: "The biggest football event of the year.",
      category: "Sport",
    },
     {
      organizerName: "Lionel Messi",
      organizerTitle: "Footballer",
      organizerAvatar:
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Lionel_Messi_20180626.jpg",
      eventImageUrl:
        "https://cdn.pixabay.com/photo/2017/05/15/17/57/football-2313165_1280.jpg",
      eventName: "Champions League Finals",
      eventPrize: "$100,000",
      eventDescription: "The biggest football event of the year.",
      category: "Sport",
    },
    // Tournament
    {
      organizerName: "Jane Doe",
      organizerTitle: "Esports Manager",
      organizerAvatar:
        "https://cdn.pixabay.com/photo/2017/08/30/01/05/person-2698304_1280.jpg",
      eventImageUrl:
        "https://cdn.pixabay.com/photo/2015/09/05/21/51/gaming-925091_1280.jpg",
      eventName: "Esports Tournament 2025",
      eventPrize: "$30,000",
      eventDescription: "Top gamers compete for glory.",
      category: "Tournament",
    },
     {
      organizerName: "Jane Doe",
      organizerTitle: "Esports Manager",
      organizerAvatar:
        "https://cdn.pixabay.com/photo/2017/08/30/01/05/person-2698304_1280.jpg",
      eventImageUrl:
        "https://cdn.pixabay.com/photo/2015/09/05/21/51/gaming-925091_1280.jpg",
      eventName: "Esports Tournament 2025",
      eventPrize: "$30,000",
      eventDescription: "Top gamers compete for glory.",
      category: "Tournament",
    },
     {
      organizerName: "Jane Doe",
      organizerTitle: "Esports Manager",
      organizerAvatar:
        "https://cdn.pixabay.com/photo/2017/08/30/01/05/person-2698304_1280.jpg",
      eventImageUrl:
        "https://cdn.pixabay.com/photo/2015/09/05/21/51/gaming-925091_1280.jpg",
      eventName: "Esports Tournament 2025",
      eventPrize: "$30,000",
      eventDescription: "Top gamers compete for glory.",
      category: "Tournament",
    },
  ];

  const categories = [...new Set(sampleEvent.map((e) => e.category))];

  return (
    <div className="flex pt-0 gap-6 px-6 min-h-screen">
      {/* Left Slider */}
      <Slider />

      {/* Main Event Grid */}
      <div className="flex-1 space-y-10">
        {categories.map((category) => {
          const eventsOfCategory = sampleEvent.filter(
            (e) => e.category === category
          );
          if (!eventsOfCategory.length) return null;

          return (
            <div key={category}>
              {/* Category Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {category}
              </h2>

              {/* Flexible Cards */}
              <div className="flex flex-wrap gap-6">
                {eventsOfCategory.map((event, idx) => (
                  <div
                    key={idx}
                    className="flex-1 min-w-[250px] max-w-[300px]"
                  >
                    <Cards eventData={event} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Events;

