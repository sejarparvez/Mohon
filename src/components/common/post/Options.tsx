const Options = [
  "Technology News",
  "Programming",
  "Web Development",
  "Internet of Things",
  "Tech Reviews",
  "Software Development",
  "Adobe Illustrator",
  "Adobe Photoshop",
  "Backgrounds",
  "Textures",
  "Patterns",
  "Vector",
  "Drawing",
  "Clip Art",
  "Silhouettes",
  "Cartoons",
  "Symbols and Signs",
  "Social Media",
  "Business Cards",
  "Greeting Cards",
  "Invitations Cards",
  "Banners",
  "Flyers",
  "Posters",
  "Stationery",
  "Logos",
  "Mockups",
  "Typography Font",
  "Photo Editing",
  "Lightroom",
  "Video Editing",
  "Ethical Hacking",
  "Photos",
  "Web Design",
  "Digital Marketing",
  "Auto Cad",
  "Office Applications",
  "Database Programming",
  "Data Entry",
  "Class",
  "Projects",
];

const optionsWithLinks = Options.map((option) => ({
  value: option.toLowerCase().replace(/\s+/g, "_"),
  label: option,
}));

// Sort the array alphabetically by the 'label' property
optionsWithLinks.sort((a, b) => a.label.localeCompare(b.label));

export default optionsWithLinks;
