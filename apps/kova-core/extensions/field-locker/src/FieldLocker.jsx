import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useEffect, useState} from 'preact/hooks';
import {
  decodeLoadoutParams, encodeLoadoutParams, equipmentFromOrders, purchasedLoadouts,
  removeSaved, upsertSaved, numericId, loadoutId,
} from '../../../shared/field-locker';
import {loadAccount, loadCatalogue, writeSaved, orderHref} from '../../../shared/account-data';

// Field Locker: the customer's KOVA orders, loadouts, equipment and documents on one account page.
// Orders stay native; this page links to them rather than rebuilding them.
export default async () => {
  render(<FieldLocker />, document.body);
};

const BUILDER_PATH = '/pages/build-a-loadout';
const t = (key, replacements) => shopify.i18n.translate(key, replacements);
const date = (iso) => shopify.i18n.formatDate(new Date(iso), {day: 'numeric', month: 'short', year: 'numeric'});

// The page URL can change without a remount (a save clears the query), so follow the current entry.
function useCurrentUrl() {
  const [url, setUrl] = useState(() => navigation.currentEntry.url);
  useEffect(() => {
    const update = () => setUrl(navigation.currentEntry.url);
    navigation.addEventListener('currententrychange', update);
    return () => navigation.removeEventListener('currententrychange', update);
  }, []);
  return url;
}

function FieldLocker() {
  const [state, setState] = useState(/** @type {any} */ ({status: 'loading'}));
  const url = useCurrentUrl();
  const [dismissed, setDismissed] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const decoded = decodeLoadoutParams(new URL(url).search);
  const incoming = decoded && loadoutId(decoded) !== dismissed ? decoded : null;

  useEffect(() => {
    load().then(setState, (error) => setState({status: 'error', message: String(error.message || error)}));
  }, []);

  // A loadout saved from the builder can hold objects the customer has not bought yet.
  useEffect(() => {
    if (state.status !== 'ready' || !incoming) return;
    const missing = [incoming.platform, ...incoming.modules]
      .map((pick) => pick.handle)
      .filter((handle) => !state.catalogue.products.has(handle));
    if (!missing.length) return;
    loadCatalogue(shopify.query, [], missing).then(({products}) => setState((current) => ({
      ...current,
      catalogue: {...current.catalogue, products: new Map([...current.catalogue.products, ...products])},
    })), () => {});
  }, [state.status, url]);

  if (state.status === 'loading') {
    return (
      <s-page key="loading" heading={t('heading')}>
        <s-section><s-skeleton-paragraph content={t('loading')}></s-skeleton-paragraph></s-section>
      </s-page>
    );
  }
  if (state.status === 'error') {
    return (
      <s-page key="error" heading={t('heading')}>
        <s-banner tone="critical" heading={t('error.heading')}><s-text>{state.message}</s-text></s-banner>
      </s-page>
    );
  }

  const {customerId, orders, saved, catalogue} = state;

  async function persist(list, message) {
    setBusy(true);
    try {
      await writeSaved(customerId, list);
      setState({...state, saved: list});
      setNotice({tone: 'success', message});
      return true;
    } catch (error) {
      setNotice({tone: 'critical', message: t('error.save', {message: String(error.message || error)})});
      return false;
    } finally {
      setBusy(false);
    }
  }

  function clearIncoming() {
    setDismissed(loadoutId(incoming));
    navigation.navigate('extension:/');
  }

  async function saveIncoming() {
    if (await persist(upsertSaved(saved, incoming, new Date().toISOString()), t('saved.added'))) clearIncoming();
  }

  const equipment = equipmentFromOrders(orders);
  const purchased = purchasedLoadouts(orders);
  const product = (key) => catalogue.products.get(key) ?? null;

  return (
    <s-page key="ready" heading={t('heading')} subheading={t('subheading')}>
      {notice && (
        <s-banner tone={notice.tone} dismissible onDismiss={() => setNotice(null)}>
          <s-text>{notice.message}</s-text>
        </s-banner>
      )}
      {incoming && (
        <s-banner tone="info" heading={t('incoming.heading')}>
          <s-stack gap="base">
            <LoadoutSummary pick={incoming} product={product} catalogue={catalogue} />
            <s-button-group>
              <s-button slot="primary-action" variant="primary" loading={busy} onClick={saveIncoming}>{t('incoming.save')}</s-button>
              <s-button slot="secondary-actions" variant="secondary" disabled={busy} onClick={clearIncoming}>{t('incoming.dismiss')}</s-button>
            </s-button-group>
          </s-stack>
        </s-banner>
      )}

      <s-section heading={t('orders.heading')}>
        {orders.length === 0 ? (
          <s-paragraph color="subdued">{t('orders.empty')}</s-paragraph>
        ) : (
          <s-stack gap="small-200">
            {/* The rows get their own stack: beside a sibling link the host rendered them out of order. */}
            <s-stack gap="small-200">
              {orders.slice(0, 3).map((order) => (
                <s-stack key={order.id} direction="inline" gap="base" justifyContent="space-between">
                  <s-link href={orderHref(order.id)}>{order.name}</s-link>
                  <s-text color="subdued">{date(order.processedAt)}</s-text>
                </s-stack>
              ))}
            </s-stack>
            <s-link href="shopify:customer-account/orders">{t('orders.all')}</s-link>
          </s-stack>
        )}
      </s-section>

      <s-section heading={t('loadouts.heading')}>
        <s-stack gap="base">
          {saved.length === 0 && purchased.length === 0 && (
            <s-paragraph color="subdued">{t('loadouts.empty')}</s-paragraph>
          )}
          {saved.map((entry) => (
            <s-box key={entry.id} padding="base" border="base" borderRadius="base">
              <s-stack gap="small-200">
                <LoadoutSummary pick={entry} product={product} catalogue={catalogue} />
                <s-text color="subdued">{t('loadouts.saved', {date: date(entry.savedAt)})}</s-text>
                <s-stack direction="inline" gap="base" alignItems="center">
                  <s-link href={`${catalogue.shopUrl}${BUILDER_PATH}?${encodeLoadoutParams(entry)}`}>{t('loadouts.rebuild')}</s-link>
                  <s-button variant="secondary" disabled={busy}
                    onClick={() => persist(removeSaved(saved, entry.id), t('saved.removed'))}>{t('loadouts.remove')}</s-button>
                </s-stack>
              </s-stack>
            </s-box>
          ))}
          {purchased.map((loadout) => {
            const pick = purchasedPick(loadout, product, catalogue);
            return (
              <s-box key={loadout.id} padding="base" border="base" borderRadius="base">
                <s-stack gap="small-200">
                  <s-text type="strong">{loadoutName(pick?.loadout, catalogue) ?? t('loadouts.fallbackName')}</s-text>
                  <Thumbnails lines={[loadout.platform, ...loadout.modules]} />
                  <s-text>{[loadout.platform, ...loadout.modules].map((line) => line.title).join(' · ')}</s-text>
                  <s-text color="subdued">{t('loadouts.purchased', {order: loadout.orderName, date: date(loadout.processedAt)})}</s-text>
                  {pick && (
                    <s-link href={`${catalogue.shopUrl}${BUILDER_PATH}?${encodeLoadoutParams(pick)}`}>{t('loadouts.rebuild')}</s-link>
                  )}
                </s-stack>
              </s-box>
            );
          })}
          <s-link href={`${catalogue.shopUrl}${BUILDER_PATH}`}>{t('loadouts.build')}</s-link>
        </s-stack>
      </s-section>

      <s-section heading={t('equipment.heading')}>
        {equipment.length === 0 ? (
          <s-paragraph color="subdued">{t('equipment.empty')}</s-paragraph>
        ) : (
          <s-stack gap="base">
            {equipment.map((item) => (
              <s-stack key={item.productId} direction="inline" gap="base" alignItems="center">
                <s-product-thumbnail src={item.image?.url ?? product(item.productId)?.featuredImage?.url}
                  alt={item.image?.altText ?? item.title} size="small"></s-product-thumbnail>
                <s-stack gap="none">
                  <s-text type="strong">{item.title}</s-text>
                  <s-text color="subdued">{t('equipment.registered', {date: date(item.registeredAt), order: item.orderName})}</s-text>
                </s-stack>
              </s-stack>
            ))}
          </s-stack>
        )}
      </s-section>

      <s-section heading={t('documents.heading')}>
        {equipment.length === 0 ? (
          <s-paragraph color="subdued">{t('documents.empty')}</s-paragraph>
        ) : (
          <s-stack gap="base">
            {equipment.map((item) => {
              const record = product(item.productId);
              const guide = record?.guide?.reference;
              const material = record?.material?.reference;
              return (
                <s-stack key={item.productId} gap="small-200">
                  <s-text type="strong">{item.title}</s-text>
                  {guide?.url ? (
                    <s-link href={guide.url} target="_blank">{t('documents.guide')}</s-link>
                  ) : (
                    <s-text color="subdued">{t('documents.guidePending')}</s-text>
                  )}
                  {material?.care?.value && (
                    <s-details>
                      <s-summary>{t('documents.care', {material: material.name?.value ?? ''})}</s-summary>
                      <s-paragraph>{material.care.value}</s-paragraph>
                    </s-details>
                  )}
                </s-stack>
              );
            })}
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}

async function load() {
  const account = await loadAccount();
  const productIds = [...new Set(account.orders.flatMap((order) => order.lineItems.nodes.map((line) => line.productId)).filter(Boolean))];
  const picks = account.saved;
  const handles = [...new Set(picks.flatMap((pick) => [pick.platform.handle, ...pick.modules.map((module) => module.handle)]))];
  const catalogue = await loadCatalogue(shopify.query, productIds, handles);
  return {status: 'ready', ...account, catalogue};
}

const loadoutName = (handle, catalogue) => catalogue.loadouts.find((loadout) => loadout.handle === handle)?.name ?? null;

// A purchased loadout carries product ids; the builder link needs handles and the loadout's handle.
function purchasedPick(loadout, product, catalogue) {
  const platform = product(loadout.platform.productId);
  const modules = loadout.modules.map((line) => ({line, record: product(line.productId)}));
  const rules = catalogue.loadouts.find((entry) => entry.platforms.includes(loadout.platform.productId));
  if (!platform || !rules || modules.some(({record}) => !record)) return null;
  return {
    loadout: rules.handle,
    platform: {handle: platform.handle, variant: numericId(loadout.platform.variantId)},
    modules: modules.map(({line, record}) => ({handle: record.handle, variant: numericId(line.variantId)})),
  };
}

function LoadoutSummary({pick, product, catalogue}) {
  const records = [pick.platform, ...pick.modules].map((entry) => product(entry.handle));
  return (
    <s-stack gap="small-200">
      <s-text type="strong">{loadoutName(pick.loadout, catalogue) ?? t('loadouts.fallbackName')}</s-text>
      <Thumbnails lines={records.map((record, index) => ({
        title: record?.title ?? [pick.platform, ...pick.modules][index].handle,
        image: record?.featuredImage ?? null,
      }))} />
      <s-text>{records.map((record, index) => record?.title ?? [pick.platform, ...pick.modules][index].handle).join(' · ')}</s-text>
      <s-text color="subdued">{t('loadouts.count', {count: pick.modules.length})}</s-text>
    </s-stack>
  );
}

function Thumbnails({lines}) {
  return (
    <s-stack direction="inline" gap="small-200">
      {lines.map((line, index) => (
        <s-product-thumbnail key={index} src={line.image?.url} alt={line.image?.altText ?? line.title} size="small"></s-product-thumbnail>
      ))}
    </s-stack>
  );
}
