// app/routes/app.api.inventory.jsx
import shopify from "../shopify.server.js";

export const loader = async ({ request }) => {
  const { admin } = await shopify.authenticate.admin(request);
  const url = new URL(request.url);
  const variantId = url.searchParams.get("variantId");

  if (!variantId) {
    return Response.json({ error: "Missing variantId parameter" }, { status: 400 });
  }

  try {
    const query = `#graphql
      query GetInventoryLevels($variantId: ID!) {
        productVariant(id: $variantId) {
          sku
          barcode
          inventoryItem {
            id
            tracked
            inventoryLevels(first: 5) {
              nodes {
                id
                quantities(names: ["available"]) { name quantity }
                location { id name }
              }
            }
          }
        }
      }
    `;

    const response = await admin.graphql(query, { variables: { variantId } });
    const responseData = await response.json();
    const variantData = responseData.data?.productVariant;

    // E-08: Unable to load inventory data right now. Please try again.
    if (!variantData) {
      return Response.json({ error: "Unable to load inventory data right now. Please try again." }, { status: 404 });
    }

    return Response.json({
      sku: variantData.sku || "",
      barcode: variantData.barcode || "",
      tracked: !!variantData.inventoryItem?.tracked,
      levels: variantData.inventoryItem?.inventoryLevels?.nodes.map((node) => ({
        locationId: node.location.id,
        locationName: node.location.name,
        quantity: node.quantities[0]?.quantity || 0,
        inventoryLevelId: node.id
      })) || []
    });
  } catch (error) {
    return Response.json({ error: "Unable to load inventory data right now. Please try again." }, { status: 500 });
  }
};