export const calendars = [
  {
    id: 'transportation',
    name: 'Transportation',
    colorName: 'personal',
    color: {
      light: {
        main: '#d0b316',
        container: '#fff5aa',
        onContainer: '#594800',
      },
      dark: {
        main: '#fff5c0',
        onContainer: '#fff5de',
        container: '#a29742',
      },
    },
  },
  {
    id: 'accommodation',
    name: 'Accomodation',
    colorName: 'work',
    color: {
      light: {
        main: '#f91c45',
        container: '#ffd2dc',
        onContainer: '#59000d',
      },
      dark: {
        main: '#ffc0cc',
        onContainer: '#ffdee6',
        container: '#a24258',
      },
    },
  },
  {
    id: 'attraction',
    name: 'Attraction',
    colorName: 'school',
    color: {
      light: {
        main: '#34d721',
        container: '#dafff0',
        onContainer: '#004d3d',
      },
      dark: {
        main: '#c0fff5',
        onContainer: '#e6fff5',
        container: '#42a297',
      },
    },
  },
];

// Log out each calendar and its colors
console.log("🎨 Loaded calendar themes:");
calendars.forEach((cal) => {
  console.log(`- ${cal.name} (${cal.id})`);
  console.log(`  🔆 Light Colors:`, cal.color.light);
  console.log(`  🌙 Dark Colors:`, cal.color.dark);
});
