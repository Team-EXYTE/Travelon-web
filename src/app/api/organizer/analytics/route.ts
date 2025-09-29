import { NextResponse } from "next/server";
import { initAdmin, getAdminDB } from "@/db/firebaseAdmin";

export async function GET(request: Request) {
  try {
    // Parse time range from query parameters
    const url = new URL(request.url);
    const timeRange = url.searchParams.get("timeRange") || "30days";

    // Get the current user
    const authResponse = await fetch(
      new URL("/api/auth/me", url.origin).toString(),
      {
        headers: request.headers,
      }
    );

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();
    const userId = authData.user?.uid;

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await initAdmin();
    const adminDB = getAdminDB();

    // Calculate the start date based on time range
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "7days":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "30days":
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case "90days":
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case "all":
      default:
        startDate = new Date(0); // Start of time
        break;
    }

    // Get user's events
    const eventsSnapshot = await adminDB
      .collection("events")
      .where("organizerId", "==", userId)
      .get();

    if (eventsSnapshot.empty) {
      // Return empty data structure if no events exist
      return NextResponse.json({
        totalRevenue: 0,
        totalTicketsSold: 0,
        totalEvents: 0,
        activeEvents: 0,
        pastEvents: 0,
        avgTicketPrice: 0,
        boostedEvents: 0,
        revenueByMonth: [],
        ticketsByMonth: [],
        eventsByCategory: [],
        recentEvents: [],
        topEvents: [],
      });
    }

    // Process events data
    let totalRevenue = 0;
    let totalTicketsSold = 0;
    let totalEvents = 0;
    let activeEvents = 0;
    let pastEvents = 0;
    let boostedEvents = 0;
    let sumTicketPrices = 0;
    const revenueByMonth: { [key: string]: number } = {};
    const ticketsByMonth: { [key: string]: number } = {};
    const eventsByCategory: { [key: string]: number } = {};
    const eventsList: any[] = [];

    // Define event type
    interface Event {
      id: string;
      date: any;
      isEnded?: boolean;
      isBoosted?: boolean;
      category?: string;
      price?: string | number;
      tickets?: Record<string, any>;
      title?: string;
      location?: string;
      maxParticipants?: number;
      images?: string[];
      createdAt?: any;
    }

    // Process each event
    eventsSnapshot.docs.forEach((doc) => {
      const event: Event = { id: doc.id, ...(doc.data() as any) };

      console.log(`Processing event ${event.id}:`, {
        title: event.title,
        dateType: typeof event.date,
        dateValue: event.date,
        hasSeconds: typeof event.date === "object" && "seconds" in event.date,
      });

      totalEvents++;

      // Handle date to ensure it's a proper JavaScript Date
      let eventDate: Date;
      if (
        typeof event.date === "object" &&
        event.date &&
        "seconds" in event.date
      ) {
        eventDate = new Date(event.date.seconds * 1000);
      } else if (typeof event.date === "string") {
        eventDate = new Date(event.date);
      } else {
        // If date is missing or invalid, use event createdAt or current date
        eventDate = event.createdAt
          ? typeof event.createdAt === "object" && "seconds" in event.createdAt
            ? new Date(event.createdAt.seconds * 1000)
            : new Date(event.createdAt)
          : new Date();

        console.warn(
          `Event ${event.id} has invalid date, using fallback:`,
          eventDate
        );
      }

      // Skip events outside the selected time range if not "all"
      if (timeRange !== "all" && eventDate < startDate) {
        return;
      }

      // Count active/past events
      if (event.isEnded) {
        pastEvents++;
      } else {
        activeEvents++;
      }

      // Count boosted events
      if (event.isBoosted) {
        boostedEvents++;
      }

      // Track categories
      if (event.category) {
        eventsByCategory[event.category] =
          (eventsByCategory[event.category] || 0) + 1;
      }

      // Calculate revenue and tickets
      const price =
        event.price !== undefined ? parseFloat(String(event.price)) : 0;
      const ticketsSold = event.tickets ? Object.keys(event.tickets).length : 0;
      const revenue = price * ticketsSold;

      totalRevenue += revenue;
      totalTicketsSold += ticketsSold;

      if (price > 0) {
        sumTicketPrices += price;
      }

      // Format for monthly tracking
      const monthKey = eventDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + revenue;
      ticketsByMonth[monthKey] = (ticketsByMonth[monthKey] || 0) + ticketsSold;

      // Add to events list for sorting later
      eventsList.push({
        id: event.id,
        title: event.title || "Untitled Event",
        // Use the eventDate we calculated above instead of the raw event.date
        date: {
          seconds: Math.floor(eventDate.getTime() / 1000),
          nanoseconds: 0,
        },
        location: event.location || "Unknown",
        price: event.price || "0",
        ticketsSold,
        maxParticipants: event.maxParticipants || 0,
        revenue,
        image: event.images && event.images.length > 0 ? event.images[0] : null,
        isBoosted: event.isBoosted || false,
      });
    });

    // Calculate average ticket price (excluding free events)
    const avgTicketPrice = totalEvents > 0 ? sumTicketPrices / totalEvents : 0;

    // Format data for charts
    const revenueByMonthArray = Object.keys(revenueByMonth)
      .map((month) => ({
        month,
        revenue: revenueByMonth[month],
      }))
      .sort((a, b) => {
        // Sort by date (assuming format "MMM YYYY")
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });

    const ticketsByMonthArray = Object.keys(ticketsByMonth)
      .map((month) => ({
        month,
        tickets: ticketsByMonth[month],
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });

    const eventsByCategoryArray = Object.keys(eventsByCategory)
      .map((category) => ({
        category,
        count: eventsByCategory[category],
      }))
      .sort((a, b) => b.count - a.count);

    // Sort events by date (recent) and revenue (top)
    const sortedByDate = [...eventsList].sort((a, b) => {
      const dateA = a.date.seconds
        ? new Date(a.date.seconds * 1000)
        : new Date(a.date);
      const dateB = b.date.seconds
        ? new Date(b.date.seconds * 1000)
        : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    const sortedByRevenue = [...eventsList].sort(
      (a, b) => b.revenue - a.revenue
    );

    return NextResponse.json({
      totalRevenue,
      totalTicketsSold,
      totalEvents,
      activeEvents,
      pastEvents,
      avgTicketPrice,
      boostedEvents,
      revenueByMonth: revenueByMonthArray,
      ticketsByMonth: ticketsByMonthArray,
      eventsByCategory: eventsByCategoryArray,
      recentEvents: sortedByDate.slice(0, 5),
      topEvents: sortedByRevenue.slice(0, 3),
    });
  } catch (error: any) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
