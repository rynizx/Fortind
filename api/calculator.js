// Calculator API endpoint for Fortind
// Provides basic arithmetic operations via HTTP endpoint

export const config = {
  runtime: "experimental-edge",
};

export default async function (req, event) {
  const url = new URL(req.url);
  
  // Handle CORS for browser requests
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  try {
    let params;
    
    if (req.method === "GET") {
      // GET request - parse query parameters
      params = Object.fromEntries(url.searchParams.entries());
    } else if (req.method === "POST") {
      // POST request - parse JSON body
      const body = await req.text();
      params = body ? JSON.parse(body) : {};
    } else {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }), 
        { status: 405, headers }
      );
    }

    const { operation, a, b } = params;
    
    // Validate inputs
    if (!operation) {
      return new Response(
        JSON.stringify({ error: "Missing operation parameter" }), 
        { status: 400, headers }
      );
    }

    const numA = parseFloat(a);
    const numB = parseFloat(b);

    if (isNaN(numA)) {
      return new Response(
        JSON.stringify({ error: "Invalid number for parameter 'a'" }), 
        { status: 400, headers }
      );
    }

    let result;
    
    switch (operation.toLowerCase()) {
      case 'add':
      case '+':
        if (isNaN(numB)) {
          return new Response(
            JSON.stringify({ error: "Invalid number for parameter 'b'" }), 
            { status: 400, headers }
          );
        }
        result = numA + numB;
        break;
        
      case 'subtract':
      case '-':
        if (isNaN(numB)) {
          return new Response(
            JSON.stringify({ error: "Invalid number for parameter 'b'" }), 
            { status: 400, headers }
          );
        }
        result = numA - numB;
        break;
        
      case 'multiply':
      case '*':
        if (isNaN(numB)) {
          return new Response(
            JSON.stringify({ error: "Invalid number for parameter 'b'" }), 
            { status: 400, headers }
          );
        }
        result = numA * numB;
        break;
        
      case 'divide':
      case '/':
        if (isNaN(numB)) {
          return new Response(
            JSON.stringify({ error: "Invalid number for parameter 'b'" }), 
            { status: 400, headers }
          );
        }
        if (numB === 0) {
          return new Response(
            JSON.stringify({ error: "Division by zero is not allowed" }), 
            { status: 400, headers }
          );
        }
        result = numA / numB;
        break;
        
      case 'sqrt':
        if (numA < 0) {
          return new Response(
            JSON.stringify({ error: "Cannot calculate square root of negative number" }), 
            { status: 400, headers }
          );
        }
        result = Math.sqrt(numA);
        break;
        
      case 'power':
      case '^':
        if (isNaN(numB)) {
          return new Response(
            JSON.stringify({ error: "Invalid number for parameter 'b'" }), 
            { status: 400, headers }
          );
        }
        result = Math.pow(numA, numB);
        break;

      default:
        return new Response(
          JSON.stringify({ 
            error: "Unknown operation. Supported: add, subtract, multiply, divide, sqrt, power" 
          }), 
          { status: 400, headers }
        );
    }

    // Return successful result
    return new Response(
      JSON.stringify({ 
        operation: operation,
        inputs: { a: numA, b: numB },
        result: result 
      }), 
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Calculator API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }), 
      { status: 500, headers }
    );
  }
}