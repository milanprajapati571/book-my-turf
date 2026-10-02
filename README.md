# 🏟️ BookMyTurf

**BookMyTurf** is a modern, full-stack turf booking and venue management platform. It allows venue owners to seamlessly list their sports turfs, and enables users to discover, book, and pay for slots securely.

![BookMyTurf Dashboard preview placeholder]

## 🌟 Features

*   **Role-Based Access Control**: Three distinct roles - `USER` (Book turfs), `OWNER` (Manage turfs and revenue), and `ADMIN` (Platform oversight).
*   **Instant Turf Registration**: Owners can register turfs with multiple cover photos, capacities, operating hours, and multi-sport tags.
*   **Secure Payment Integration**: End-to-end booking flow powered by **Razorpay** checkout.
*   **Automated Ticketing**: Generates secure QR-code entry tickets and emails them to users via **Resend** & **React Email**.
*   **Advanced Dashboard**: Beautiful Owner dashboards to track bookings, revenue, and active venues.
*   **Review System**: Verified users can leave star ratings and reviews on turfs they've visited.
*   **Cloud Image Storage**: High-performance image hosting and delivery via **Cloudinary**.
*   **Fully Responsive UI**: Dark & Light mode support, built with Tailwind CSS and Shadcn UI.

---

## 🛠️ Tech Stack

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Language:** TypeScript
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
*   **Database:** PostgreSQL (Hosted on [Supabase](https://supabase.com/))
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand) & [TanStack React Query](https://tanstack.com/query)
*   **Payments:** [Razorpay](https://razorpay.com/)
*   **Emails:** [Resend](https://resend.com/) & React Email
*   **Image Storage:** [Cloudinary](https://cloudinary.com/)
*   **Forms & Validation:** React Hook Form + Zod

---

## 🚀 Local Setup Instructions

Follow these steps to set up the project locally for development.

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/book-my-turf.git
cd book-my-turf
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root of your project and copy the contents from `.env.example`.
```bash
cp .env.example .env
```
*Make sure to fill in your actual credentials for PostgreSQL, Razorpay, Resend, and Cloudinary.*

### 4. Setup the Database
Push the Prisma schema to your PostgreSQL database to create the necessary tables.
```bash
npx prisma db push
```

*(Optional) If you want to test with dummy data, you can run the seed script. However, turf registration is self-serve via the UI!*

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔮 Future Scope & Roadmap

While BookMyTurf MVP is fully functional, here are some exciting features planned for the future:

1.  **Geolocation & Maps Integration**: Google Maps API integration to show users nearby turfs based on their current location.
2.  **Advanced Analytics**: A comprehensive charting dashboard for owners to track peak hours, revenue trends, and user retention.
3.  **Wallet & Credits System**: An in-app wallet allowing frequent players to purchase credits at a discount and use them for 1-click bookings.
4.  **Social Matchmaking**: A feature for users to find "teams" or join existing games if a turf slot isn't fully occupied.
5.  **Mobile Application**: Porting the booking flow to a native mobile app using React Native or Expo.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/milanprajapati571/book-my-turf/issues).

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
