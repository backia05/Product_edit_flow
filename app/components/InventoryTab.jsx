// app/components/InventoryTab.jsx
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { BlockStack, Checkbox, Select, TextField, Button, InlineStack, Banner } from "@shopify/polaris";

export function InventoryTab({ product }) {
  const fetcher = useFetcher();
  const [loaded, setLoaded] = useState(false);

  const [tracked, setTracked] = useState(false);
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [quantity, setQuantity] = useState("0");

  useEffect(() => {
    if (!loaded && product.variantId) {
      const encodedVariantId = encodeURIComponent(product.variantId);
      fetcher.load(`/app/products/${product.handle}/edit?_inventory=true&variantId=${encodedVariantId}`);
      setLoaded(true);
    }
  }, [loaded, product.variantId, product.handle]);

  useEffect(() => {
    if (fetcher.data && !fetcher.data.error) {
      setTracked(fetcher.data.tracked);
      setSku(fetcher.data.sku);
      setBarcode(fetcher.data.barcode);
      if (fetcher.data.levels?.length > 0) {
        setSelectedLocation(fetcher.data.levels[0].locationId);
        setQuantity(String(fetcher.data.levels[0].quantity));
      }
    }
  }, [fetcher.data]);

  if (fetcher.state === "loading" && !fetcher.data) {
    return <p>Loading inventory data...</p>;
  }

  if (fetcher.data?.error) {
    return (
      <Banner tone="critical" title="Error loading inventory">
        <p>{fetcher.data.error}</p>
      </Banner>
    );
  }

  const locationsOptions = (fetcher.data?.levels || []).map((lvl) => ({
    label: lvl.locationName,
    value: lvl.locationId,
  }));

  const handleSaveInventory = () => {
    const payload = new FormData();
    payload.append("handle", product.handle);
    payload.append("variantId", product.variantId);
    payload.append("_tab", "inventory");
    payload.append("tracked", String(tracked));
    payload.append("sku", sku);
    payload.append("barcode", barcode);
    payload.append("locationId", selectedLocation);
    payload.append("quantity", quantity);

    // Save the original loaded inventory state to calculate the diff on the server
    payload.append("originalInventoryState", JSON.stringify({
      tracked: fetcher.data.tracked,
      sku: fetcher.data.sku,
      barcode: fetcher.data.barcode,
      quantity: fetcher.data.levels?.find((l) => l.locationId === selectedLocation)?.quantity || 0,
    }));

    // Submit the form data directly to the action on the main product edit page
    fetcher.submit(payload, { method: "POST", action: `/app/products/${product.handle}/edit` });
  };

  return (
    <BlockStack gap="400">
      <Checkbox
        label="Track quantity"
        checked={tracked}
        onChange={setTracked}
      />

      <TextField label="SKU" value={sku} onChange={setSku} autoComplete="off" />
      <TextField label="Barcode" value={barcode} onChange={setBarcode} autoComplete="off" />

      {tracked && (
        <BlockStack gap="300">
          <Select
            label="Location context"
            options={locationsOptions}
            value={selectedLocation}
            onChange={(val) => {
              setSelectedLocation(val);
              const found = fetcher.data?.levels?.find((l) => l.locationId === val);
              setQuantity(String(found?.quantity || 0));
            }}
          />
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={setQuantity}
            autoComplete="off"
          />
        </BlockStack>
      )}

      <InlineStack align="end">
        <Button onClick={handleSaveInventory} variant="primary">Save Inventory</Button>
      </InlineStack>
    </BlockStack>
  );
}