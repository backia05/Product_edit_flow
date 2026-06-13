// extensions/product-edit-trigger/src/ActionExtension.jsx
import '@shopify/ui-extensions/preact';
import { render } from "preact";

export default async () => {
  render(<App />, document.body);
};

function App() {
  const { data, navigation, query } = shopify;
  const rawId = data.selected[0]?.id;

  const handleActionClick = async () => {
    if (!rawId) return;

    const resolveGql = `#graphql
      query ResolveHandle($id: ID!) {
        product(id: $id) {
          handle
        }
      }
    `;

    try {
      const response = await query(resolveGql, { variables: { id: rawId } });
      const handle = response.data?.product?.handle;

      if (handle) {
        // Redirection target mapping directly to your app route
        navigation.navigate(`/admin/apps/product_editor-11/app/products/${handle}/edit`);
        navigation.close();
      }
    } catch (e) {
      console.error("Navigation handle query error: ", e);
    }
  };

  return (
    <s-admin-action heading="Edit Pricing & Inventory">
      <s-text>Manage your product metrics securely via our change-optimized workflow.</s-text>
      <s-button slot="primary-action" onClick={handleActionClick}>
        Open Edit Flow
      </s-button>
    </s-admin-action>
  );
}