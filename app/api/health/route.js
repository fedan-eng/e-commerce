import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connection
    let dbStatus = "disconnected";
    let dbError = null;
    
    if (mongoose.connection.readyState === 1) {
      dbStatus = "connected";
    } else if (mongoose.connection.readyState === 2) {
      dbStatus = "connecting";
    } else {
      dbStatus = "disconnected";
    }

    // Check environment variables
    const envChecks = {
      mongodb: !!process.env.MONGODB_URI,
      jwt: !!process.env.JWT_SECRET,
      email: !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS,
      gemini: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here",
      openai: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here",
    };

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      database: {
        status: dbStatus,
        error: dbError,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        configured: Object.values(envChecks).filter(Boolean).length,
        total: Object.keys(envChecks).length,
        checks: envChecks,
      },
      services: {
        ai: envChecks.gemini || envChecks.openai ? "available" : "unavailable",
        email: envChecks.email ? "available" : "unavailable",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 500 }
    );
  }
}
