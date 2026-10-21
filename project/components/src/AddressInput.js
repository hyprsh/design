/* AddressInput: a postal-address fieldset whose fields follow the chosen country (state + ZIP for the US,
   postal code before city for most of Europe, and so on). Country names come from Intl.DisplayNames.
   With `suggestions` (a list, or a function returning a list or a Promise) or a `provider` ({ search }),
   the street field becomes a search box and the remaining fields appear once an address is picked.
   It never calls the network itself. Values: { country, line1, line2, city, region, postalCode }. */
var ADDRESS_US = [['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming']];
var ADDRESS_CA = [['AB', 'Alberta'], ['BC', 'British Columbia'], ['MB', 'Manitoba'], ['NB', 'New Brunswick'], ['NL', 'Newfoundland and Labrador'], ['NS', 'Nova Scotia'], ['NT', 'Northwest Territories'], ['NU', 'Nunavut'], ['ON', 'Ontario'], ['PE', 'Prince Edward Island'], ['QC', 'Quebec'], ['SK', 'Saskatchewan'], ['YT', 'Yukon']];
var ADDRESS_AU = [['ACT', 'Australian Capital Territory'], ['NSW', 'New South Wales'], ['NT', 'Northern Territory'], ['QLD', 'Queensland'], ['SA', 'South Australia'], ['TAS', 'Tasmania'], ['VIC', 'Victoria'], ['WA', 'Western Australia']];
var ADDRESS_AE = [['AZ', 'Abu Dhabi'], ['AJ', 'Ajman'], ['DU', 'Dubai'], ['FU', 'Fujairah'], ['RK', 'Ras al-Khaimah'], ['SH', 'Sharjah'], ['UQ', 'Umm al-Quwain']];
var ADDRESS_HK = [['HK', 'Hong Kong Island'], ['KLN', 'Kowloon'], ['NT', 'New Territories']];

/* city/region/postal layout per country; `postalFirst` puts the code before the city on one row */
var ADDRESS_FORMATS = {
  US: { city: 'City', region: 'State', regions: ADDRESS_US, postal: 'ZIP Code', postalAuto: 'postal-code' },
  CA: { city: 'City', region: 'Province', regions: ADDRESS_CA, postal: 'Postal Code' },
  AU: { city: 'Suburb', region: 'State', regions: ADDRESS_AU, postal: 'Postcode' },
  AE: { city: 'City', region: 'Emirate', regions: ADDRESS_AE, postal: null },
  HK: { city: null, region: 'Area', regions: ADDRESS_HK, postal: null },
  GB: { city: 'Town or City', postal: 'Postcode' },
  IE: { city: 'Town or City', region: 'County', postal: 'Eircode' }
};
var ADDRESS_DEFAULT = { city: 'City', postal: 'Postal Code', postalFirst: true };
function addressFormat(country) { return ADDRESS_FORMATS[country] || ADDRESS_DEFAULT; }

var ADDRESS_SKIP = { EU: 1, EZ: 1, UN: 1, QO: 1, XA: 1, XB: 1, ZZ: 1, UK: 1, AC: 1, CP: 1, DG: 1, EA: 1, IC: 1, TA: 1, CQ: 1 };
var addressCountryCache = {};
function addressCountries(locale) {
  var key = locale || '';
  if (addressCountryCache[key]) return addressCountryCache[key];
  var out = [];
  var dn = null;
  try { dn = new Intl.DisplayNames(locale ? [locale] : undefined, { type: 'region', fallback: 'none' }); } catch (e) { dn = null; }
  var A = 65;
  for (var i = 0; i < 26; i++) for (var j = 0; j < 26; j++) {
    var code = String.fromCharCode(A + i) + String.fromCharCode(A + j);
    if (ADDRESS_SKIP[code]) continue;
    var name = null;
    try { name = dn ? dn.of(code) : null; } catch (e) { name = null; }
    if (name && name !== code) out.push({ value: code, label: name });
  }
  out.sort(function (a, b) { return a.label.localeCompare(b.label, locale); });
  addressCountryCache[key] = out;
  return out;
}

function addressArticle(word) { var w = word.toLowerCase(); return (/^[aeiou]/.test(w) ? 'an ' : 'a ') + w; }

function getAddressErrors(address) {
  var a = address || {};
  var f = addressFormat(a.country);
  var e = {};
  if (!a.country) e.country = 'Select a country.';
  if (!a.line1 || !String(a.line1).trim()) e.line1 = 'Enter street address.';
  if (f.city && (!a.city || !String(a.city).trim())) e.city = 'Enter ' + f.city.toLowerCase() + '.';
  if (f.regions && !a.region) e.region = 'Select ' + addressArticle(f.region) + '.';
  if (f.postal && (!a.postalCode || !String(a.postalCode).trim())) e.postalCode = 'Enter ' + f.postal.toLowerCase() + '.';
  return e;
}

var ADDRESS_DEMO = [
  { line1: '123 Market Street', city: 'San Francisco', region: 'CA', postalCode: '94105', country: 'US' },
  { line1: '1200 Pennsylvania Avenue', city: 'Arlington', region: 'VA', postalCode: '22202', country: 'US' },
  { line1: '45 Harbour Road', city: 'Toronto', region: 'ON', postalCode: 'M5J 2N8', country: 'CA' },
  { line1: '12 George Street', city: 'Sydney', region: 'NSW', postalCode: '2000', country: 'AU' },
  { line1: 'Hauptstraße 10', city: 'Berlin', postalCode: '10115', country: 'DE' },
  { line1: 'Musterweg 4', city: 'Hamburg', postalCode: '20095', country: 'DE' },
  { line1: '8 Canal Walk', city: 'London', postalCode: 'N1 7RB', country: 'GB' }
];

function addressRegionName(country, code) {
  var f = addressFormat(country);
  var r = (f.regions || []).filter(function (x) { return x[0] === code; })[0];
  return r ? r[1] : code;
}

function AddressInput(props) {
  var auto = useId();
  var base = props.name || 'address';
  var locale = props.locale;
  var empty = { country: '', line1: '', line2: '', city: '', region: '', postalCode: '' };
  var vs = useControllable(props.value, Object.assign({}, empty, props.defaultValue || {}), props.onChange);
  var addr = Object.assign({}, empty, vs[0] || {});
  var errors = props.errors || {};
  var f = addressFormat(addr.country);
  var searchable = !!(props.suggestions || props.provider);
  var ms = useState(!searchable || !!(addr.line1 || addr.city));
  var expanded = ms[0], setExpanded = ms[1];
  var qs = useState(addr.line1 || '');
  var query = qs[0], setQuery = qs[1];
  var rs = useState([]);
  var results = rs[0], setResults = rs[1];
  var ls = useState(false);
  var loading = ls[0], setLoading = ls[1];
  var os = useState(false);
  var open = os[0], setOpen = os[1];
  var as = useState(-1);
  var active = as[0], setActive = as[1];
  var fs = useState('');
  var failed = fs[0], setFailed = fs[1];
  var box = useRef(null);
  var listRef = useRef(null);
  /* the list lines up with the text box itself, not the label above it */
  var anchor = useMemo(function () {
    return Object.defineProperty({}, 'current', { get: function () { return box.current ? box.current.querySelector('.hy-input') || box.current : null; } });
  }, []);
  var seq = useRef(0);
  var listId = auto + '-suggestions';

  var allCountries = addressCountries(locale);
  var countries = props.countries
    ? allCountries.filter(function (c) { return props.countries.indexOf(c.value) >= 0; })
    : allCountries;

  function set(patch) { vs[1](Object.assign({}, addr, patch)); }
  useDismiss(open, [box, listRef], function () { setOpen(false); });
  var listOpen = !!(open && (results.length || loading || query.trim()));
  var pos = useFloating(listOpen, anchor, listRef, { side: 'bottom', align: 'start' });
  var anchorWidth = listOpen && anchor.current ? anchor.current.offsetWidth : undefined;
  /* useFloating re-measures on any scroll: nudge it when the list's height changes */
  useLayoutEffect(function () {
    if (listOpen && listRef.current) listRef.current.dispatchEvent(new Event('scroll'));
  }, [listOpen, results.length, loading, anchorWidth]);

  function search(text) {
    var id = ++seq.current;
    if (!text.trim()) { setResults([]); setLoading(false); return; }
    var src = props.provider && props.provider.search ? props.provider.search(text, addr.country || undefined)
      : typeof props.suggestions === 'function' ? props.suggestions(text, addr.country || undefined)
        : (Array.isArray(props.suggestions) ? props.suggestions : []).filter(function (s) {
          var t = text.toLowerCase();
          var hay = [s.line1, s.city, s.postalCode].join(' ').toLowerCase();
          return hay.indexOf(t) >= 0 && (!addr.country || !s.country || s.country === addr.country);
        });
    function done(list) {
      if (id !== seq.current) return;
      setLoading(false);
      setFailed('');
      setResults((list || []).slice(0, 8));
      setActive(list && list.length ? 0 : -1);
    }
    if (src && typeof src.then === 'function') {
      setLoading(true);
      src.then(done, function () {
        if (id !== seq.current) return;
        setLoading(false); setResults([]);
        setFailed('Address lookup is unavailable. Enter the address manually.');
        setExpanded(true);
      });
    } else done(src);
  }
  function choose(s) {
    function fill(full) {
      var next = Object.assign({}, empty, { country: addr.country }, full || s);
      if (!next.country) next.country = addr.country;
      vs[1](next);
      setQuery(next.line1 || '');
      setExpanded(true);
      setLoading(false);
    }
    setOpen(false);
    if (props.provider && props.provider.details) {
      setLoading(true);
      Promise.resolve(props.provider.details(s)).then(fill, function () { fill(s); });
    } else fill(s);
  }
  function onSearchKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(Math.min(results.length - 1, active + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(0, active - 1)); }
    else if (e.key === 'Enter' && open && active >= 0 && results[active]) { e.preventDefault(); choose(results[active]); }
    else if (e.key === 'Escape' && open) { e.preventDefault(); e.stopPropagation(); setOpen(false); }
  }
  function describe(s) {
    return [s.city, s.region ? addressRegionName(s.country || addr.country, s.region) : null, s.country ? (countries.concat(allCountries).filter(function (c) { return c.value === s.country; })[0] || { label: s.country }).label : null]
      .filter(Boolean).join(', ');
  }
  function field(key, label, auto2, extra) {
    return h(HY.Input, Object.assign({
      key: key, label: label, name: base + '.' + key, autoComplete: auto2, value: addr[key] || '', error: errors[key], disabled: props.disabled,
      onChange: function (e) { var p = {}; p[key] = e.target.value; set(p); }
    }, extra || {}));
  }
  function regionField() {
    return h(HY.Select, {
      key: 'region', label: f.region, name: base + '.region', autoComplete: 'address-level1', value: addr.region || '',
      placeholder: 'Select ' + addressArticle(f.region), error: errors.region, disabled: props.disabled,
      options: f.regions.map(function (r) { return { value: r[0], label: r[1] }; }),
      onChange: function (e) { set({ region: e.target.value }); }
    });
  }

  var street = searchable
    ? h('div', { className: 'hy-address__search', ref: box },
      h(HY.Input, {
        label: 'Street Address', name: base + '.line1', autoComplete: 'address-line1', value: query,
        placeholder: props.placeholder || 'Start typing an address…', error: errors.line1, disabled: props.disabled,
        prefix: h(Glyph, { name: 'search', size: 16 }), prefixStyling: false,
        suffix: loading ? h(HY.Spinner, { size: 16 }) : null, suffixStyling: false,
        role: 'combobox', 'aria-expanded': open && (results.length > 0 || loading), 'aria-controls': listId, 'aria-autocomplete': 'list',
        'aria-activedescendant': open && active >= 0 ? listId + '-' + active : undefined,
        onChange: function (e) { setQuery(e.target.value); set({ line1: e.target.value }); setOpen(true); search(e.target.value); },
        onFocus: function () { if (results.length) setOpen(true); },
        onKeyDown: onSearchKey
      }),
      listOpen ? portal(h('ul', {
        ref: listRef, id: listId, role: 'listbox', 'aria-label': 'Address suggestions',
        className: cx('hy-address__list', pos && 'hy-address__list--' + pos.side),
        style: floatingStyle(pos, { width: anchorWidth }),
        onMouseDown: function (e) { e.preventDefault(); }
      },
        loading ? h('li', { className: 'hy-address__status', role: 'presentation' }, h(HY.Spinner, { size: 16 }), 'Searching…')
          : !results.length ? h('li', { className: 'hy-address__status', role: 'presentation' }, 'No matching addresses.')
            : results.map(function (s, i) {
              return h('li', {
                key: i, id: listId + '-' + i, role: 'option', 'aria-selected': i === active,
                className: cx('hy-address__option', i === active && 'is-active'),
                onMouseMove: function () { if (active !== i) setActive(i); },
                onClick: function () { choose(s); }
              },
                h(HY.Icon, { name: 'map-pin', size: 16, className: 'hy-address__pin' }),
                h('span', { className: 'hy-address__lines' },
                  h('span', { className: 'hy-address__line1' }, s.line1),
                  h('span', { className: 'hy-address__line2' }, describe(s))));
            }))) : null)
    : field('line1', 'Street Address', 'address-line1');

  var cityField = f.city ? field('city', f.city, 'address-level2') : null;
  var postalField = f.postal ? field('postalCode', f.postal, 'postal-code') : null;
  var regionEl = f.regions ? regionField() : (f.region ? field('region', f.region, 'address-level1') : null);
  var rest;
  if (f.postalFirst) rest = [h('div', { key: 'pc', className: 'hy-address__pair hy-address__pair--postal-first' }, postalField, cityField)];
  else rest = [cityField, (regionEl || postalField) ? h('div', { key: 'rp', className: cx('hy-address__pair', !(regionEl && postalField) && 'hy-address__pair--one') }, regionEl, postalField) : null];

  return h('fieldset', { className: cx('hy-address', props.className), style: props.style, disabled: props.disabled },
    h('legend', { className: props.label ? 'hy-address__legend' : 'hy-sr' }, props.label || 'Address'),
    h(HY.Select, {
      label: 'Country', name: base + '.country', autoComplete: 'country', value: addr.country || '',
      placeholder: 'Select a country', error: errors.country, disabled: props.disabled, options: countries,
      onChange: function (e) { set({ country: e.target.value, region: '' }); }
    }),
    street,
    searchable && !expanded ? h('div', { className: 'hy-address__manual' },
      h(HY.Button, { variant: 'tertiary', size: 'small', onClick: function () { setExpanded(true); } }, 'Enter Address Manually')) : null,
    expanded ? h(React.Fragment, null,
      field('line2', 'Address Line 2 (Optional)', 'address-line2'),
      rest) : null,
    h('p', { className: failed ? 'hy-address__failed' : 'hy-sr', 'aria-live': 'polite' },
      failed || (loading ? 'Searching…' : open && query.trim() ? results.length + (results.length === 1 ? ' address found' : ' addresses found') : '')));
}

AddressInput.getAddressErrors = getAddressErrors;
AddressInput.demoSuggestions = ADDRESS_DEMO;
AddressInput.formats = ADDRESS_FORMATS;

define('AddressInput', AddressInput);
define('getAddressErrors', getAddressErrors);
