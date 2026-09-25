import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useEffect, useState} from 'preact/hooks';
import {purchasedLoadouts} from '../../../shared/field-locker';
import {loadCatalogue, loadOrder} from '../../../shared/account-data';

// On a native order page: the loadouts in this order and the documents for its objects, with a
// way into the Field Locker. The order itself stays Shopify's own page.
export default async () => {
  render(<FieldLockerOrder />, document.body);
};

const t = (key, replacements) => shopify.i18n.translate(key, replacements);

function FieldLockerOrder() {
  const [state, setState] = useState(/** @type {any} */ (null));

  useEffect(() => {
    const id = shopify.order.value?.id;
    if (!id) return;
    (async () => {
      const order = await loadOrder(id);
      const productIds = [...new Set(order.lineItems.nodes.map((line) => line.productId).filter(Boolean))];
      const catalogue = await loadCatalogue(shopify.query, productIds, []);
      setState({order, catalogue});
    })().catch(() => setState({failed: true}));
  }, []);

  // Nothing KOVA-specific to add while loading or on failure; the native page carries the order.
  if (!state || state.failed) return null;

  const {order, catalogue} = state;
  const loadouts = purchasedLoadouts([order]);
  const documents = [...new Map(order.lineItems.nodes
    .filter((line) => line.productId && line.productType !== 'Loadout')
    .map((line) => [line.productId, {title: line.title, guide: catalogue.products.get(line.productId)?.guide?.reference}])).values()];
  const name = (loadout) => catalogue.loadouts.find((entry) => entry.platforms.includes(loadout.platform.productId))?.name
    ?? t('fallbackName');

  return (
    <s-section heading={t('heading')}>
      <s-stack gap="base">
        {loadouts.length > 0 && (
          <s-stack gap="small-200">
            {loadouts.map((loadout) => (
              <s-text key={loadout.id}>
                {t('loadout', {name: name(loadout), objects: [loadout.platform, ...loadout.modules].map((line) => line.title).join(' · ')})}
              </s-text>
            ))}
          </s-stack>
        )}
        <s-stack gap="small-200">
          <s-text type="strong">{t('documents')}</s-text>
          <s-stack gap="small-200">
            {documents.map((doc) => (doc.guide?.url ? (
              <s-link key={doc.title} href={doc.guide.url} target="_blank">{t('guide', {title: doc.title})}</s-link>
            ) : (
              <s-text key={doc.title} color="subdued">{t('guidePending', {title: doc.title})}</s-text>
            )))}
          </s-stack>
        </s-stack>
        <s-link href="extension:field-locker">{t('open')}</s-link>
      </s-stack>
    </s-section>
  );
}
