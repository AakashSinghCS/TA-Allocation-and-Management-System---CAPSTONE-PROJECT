/**
 * Return a human-readable date like
 *   "June 5 2025"   // long form for June/July
 *   "Feb 6 2025"    // 3-letter month for the rest
 */
export default function formatDateForDisplay(date: Date): string {
  // Hand-picked month names to match your examples
  const months = [
    "Jan",  // 0
    "Feb",  // 1
    "Mar",  // 2
    "Apr",  // 3
    "May",  // 4
    "June", // 5  ← full
    "July", // 6  ← full
    "Aug",  // 7
    "Sep",  // 8
    "Oct",  // 9
    "Nov",  //10
    "Dec",  //11
  ];

  const day   = date.getDate();          // 1–31
  const month = months[date.getMonth()]; // pick name above
  const year  = date.getFullYear();      // e.g. 2025

  return `${month} ${day} ${year}`;
}
