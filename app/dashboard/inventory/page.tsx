'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Package, Plus, Search, ChevronLeft, ChevronRight,
  Edit2, Trash2, Star, StarOff, X, Upload, Image as ImageIcon,
  DollarSign, ArrowUpDown, ArrowUp, ArrowDown,
  AlertCircle, Loader2, Grid, List, FolderPlus, FileUp, Download
} from 'lucide-react';

interface InventoryItem {
  id: string; site_id: string; title: string; description: string | null;
  category: string; condition: string; price: number | null; sale_price: number | null;
  financing_available: boolean; manufacturer_id: string | null; model: string | null;
  year: number | null; serial_number: string | null; hours: number | null;
  specifications: Record<string, string>; images: string[]; primary_image: string | null;
  stock_quantity: number; sku: string | null; location: string | null;
  status: string; featured: boolean; display_order: number; slug: string | null;
  created_at: string; updated_at: string; sold_at: string | null;
}
type SortField = 'title' | 'price' | 'created_at' | 'updated_at' | 'stock_quantity' | 'category' | 'status';
type SortDir = 'asc' | 'desc';

const FM = { navy: '#1E3A6E', navyDark: '#152C54', orange: '#E85525', orangeGlow: 'rgba(232,85,37,0.1)' };
const CATEGORIES = ['Mowers','Tractors','Trimmers & Edgers','Blowers','Chainsaws','Attachments','Parts & Accessories','Utility Vehicles','Sprayers','Aerators','Snow Equipment','Other'];
const CONDITIONS = [{value:'new',label:'New'},{value:'used',label:'Used'},{value:'refurbished',label:'Refurbished'},{value:'demo',label:'Demo'}];
const STATUSES = [{value:'available',label:'Available',color:'#16a34a',bg:'#f0fdf4'},{value:'pending',label:'Pending',color:'#d97706',bg:'#fffbeb'},{value:'sold',label:'Sold',color:'#dc2626',bg:'#fef2f2'},{value:'on_hold',label:'On Hold',color:'#6366f1',bg:'#eef2ff'}];

function StatusBadge({ status }: { status: string }) {
  const s = STATUSES.find(st => st.value === status) || STATUSES[0];
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ color: s.color, background: s.bg }}>{s.label}</span>;
}
function ConditionBadge({ condition }: { condition: string }) {
  const c = CONDITIONS.find(cd => cd.value === condition);
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">{c?.label || condition}</span>;
}
function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return 'Call for Price';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
}
function generateSlug(title: string): string { return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

const EMPTY_FORM = {
  title: '', description: '', category: 'Mowers', condition: 'new' as string,
  price: null as number | null, sale_price: null as number | null,
  financing_available: false, model: '', year: new Date().getFullYear(),
  serial_number: '', hours: null as number | null, specifications: {} as Record<string, string>,
  images: [] as string[], primary_image: null as string | null,
  stock_quantity: 1, sku: '', location: '', status: 'available',
  featured: false, display_order: 0, slug: '',
};

export default function InventoryDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const PAGE_SIZE = 20;

  const [siteId, setSiteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [activeFormTab, setActiveFormTab] = useState<'details' | 'specs' | 'images'>('details');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Catalog search state
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogResults, setCatalogResults] = useState<any[]>([]);
  const [catalogSearching, setCatalogSearching] = useState(false);
  const [showCatalogResults, setShowCatalogResults] = useState(false);
  const [catalogApplied, setCatalogApplied] = useState<any>(null);
  const catalogDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000);
  }, []);

  // Catalog search with debounce
  const searchCatalog = useCallback(async (query: string) => {
    if (query.length < 2) { setCatalogResults([]); setShowCatalogResults(false); return; }
    setCatalogSearching(true);
    try {
      const res = await fetch(`/api/catalog/search?q=${encodeURIComponent(query)}&limit=8`);
      const data = await res.json();
      setCatalogResults(data.results || []);
      setShowCatalogResults(true);
    } catch (err) { console.error('Catalog search error:', err); }
    finally { setCatalogSearching(false); }
  }, []);

  const handleCatalogQueryChange = (value: string) => {
    setCatalogQuery(value);
    if (catalogDebounceRef.current) clearTimeout(catalogDebounceRef.current);
    catalogDebounceRef.current = setTimeout(() => searchCatalog(value), 300);
  };

  const mapCatalogCategory = (cat: string): string => {
    const c = (cat || '').toLowerCase();
    if (c.includes('mower') || c.includes('mowing')) return 'Mowers';
    if (c.includes('tractor') || c.includes('riding')) return 'Tractors';
    if (c.includes('trimmer') || c.includes('edger')) return 'Trimmers & Edgers';
    if (c.includes('blower')) return 'Blowers';
    if (c.includes('chainsaw') || c.includes('arborist')) return 'Chainsaws';
    if (c.includes('attach') || c.includes('accessor') || c.includes('part')) return 'Parts & Accessories';
    if (c.includes('construction') || c.includes('skid')) return 'Utility Vehicles';
    if (c.includes('sprayer')) return 'Sprayers';
    if (c.includes('aerator')) return 'Aerators';
    if (c.includes('snow')) return 'Snow Equipment';
    return 'Other';
  };

  const applyCatalogProduct = (product: any) => {
    const msrp = product.specs?.MSRP?.replace(/[$,]/g, '');
    const specs: Record<string, string> = {};
    if (product.specs) {
      Object.entries(product.specs).forEach(([k, v]) => {
        if (k !== 'MSRP') specs[k] = String(v);
      });
    }
    setForm(prev => ({
      ...prev,
      title: product.product_name,
      description: product.short_description || product.full_description?.slice(0, 500) || '',
      model: product.sku || '',
      sku: product.sku || '',
      category: mapCatalogCategory(product.category),
      price: msrp ? parseFloat(msrp) : null,
      primary_image: product.primary_image || null,
      images: product.image_urls || (product.primary_image ? [product.primary_image] : []),
      specifications: specs,
    }));
    setCatalogApplied(product);
    setShowCatalogResults(false);
    setCatalogQuery('');
  };

  const clearCatalogSelection = () => { setCatalogApplied(null); };
  const allCategories = [...new Set([...CATEGORIES, ...customCategories])];
  const uf = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasFilters = !!(searchQuery || filterCategory || filterStatus || filterCondition);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      const { data: site } = await supabase.from('sites').select('id, site_name').eq('user_id', user.id).single();
      if (!site) { router.push('/onboarding'); return; }
      setSiteId(site.id); setLoading(false);
    }
    init();
  }, []);

  const loadItems = useCallback(async () => {
    if (!siteId) return;
    setItemsLoading(true);
    let query = supabase.from('inventory_items').select('*', { count: 'exact' }).eq('site_id', siteId);
    if (searchQuery.trim()) query = query.or(`title.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`);
    if (filterCategory) query = query.eq('category', filterCategory);
    if (filterStatus) query = query.eq('status', filterStatus);
    if (filterCondition) query = query.eq('condition', filterCondition);
    query = query.order(sortField, { ascending: sortDir === 'asc' }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    const { data, count, error } = await query;
    if (error) showToast('Failed to load inventory', 'error');
    else { setItems(data || []); setTotalCount(count || 0); }
    setItemsLoading(false);
  }, [siteId, searchQuery, filterCategory, filterStatus, filterCondition, sortField, sortDir, page]);

  useEffect(() => { loadItems(); }, [loadItems]);
  useEffect(() => {
    if (!siteId) return;
    supabase.from('inventory_categories').select('name').eq('site_id', siteId).order('display_order').then(({ data }) => { if (data) setCustomCategories(data.map(c => c.name)); });
  }, [siteId]);

  const handleSort = (field: SortField) => { if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(field); setSortDir('asc'); } setPage(0); };
  const openAddModal = () => { setEditingItem(null); setForm({ ...EMPTY_FORM }); setActiveFormTab('details'); setFormError(''); setCatalogApplied(null); setCatalogQuery(''); setCatalogResults([]); setShowCatalogResults(false); setModalOpen(true); };
  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({ title: item.title||'', description: item.description||'', category: item.category||'Mowers', condition: item.condition||'new', price: item.price, sale_price: item.sale_price, financing_available: item.financing_available||false, model: item.model||'', year: item.year||new Date().getFullYear(), serial_number: item.serial_number||'', hours: item.hours, specifications: item.specifications||{}, images: item.images||[], primary_image: item.primary_image, stock_quantity: item.stock_quantity||1, sku: item.sku||'', location: item.location||'', status: item.status||'available', featured: item.featured||false, display_order: item.display_order||0, slug: item.slug||'' });
    setActiveFormTab('details'); setFormError(''); setModalOpen(true);
  };
  const handleSave = async () => {
    if (!siteId) return; if (!form.title.trim()) { setFormError('Title is required'); return; }
    setSaving(true); setFormError('');
    const record = { site_id: siteId, title: form.title.trim(), description: form.description?.trim()||null, category: form.category, condition: form.condition, price: form.price, sale_price: form.sale_price, financing_available: form.financing_available, model: form.model?.trim()||null, year: form.year, serial_number: form.serial_number?.trim()||null, hours: form.hours, specifications: form.specifications, images: form.images, primary_image: form.primary_image||(form.images.length>0?form.images[0]:null), stock_quantity: form.stock_quantity, sku: form.sku?.trim()||null, location: form.location?.trim()||null, status: form.status, featured: form.featured, display_order: form.display_order, slug: form.slug?.trim()||generateSlug(form.title), updated_at: new Date().toISOString() };
    try {
      if (editingItem) { const {error}=await supabase.from('inventory_items').update(record).eq('id',editingItem.id); if(error)throw error; showToast('Product updated'); }
      else { const {error}=await supabase.from('inventory_items').insert(record); if(error)throw error; showToast('Product added'); }
      setModalOpen(false); loadItems();
    } catch (err: any) { setFormError(err.message||'Failed to save'); }
    setSaving(false);
  };
  const handleDelete = async (id: string) => { const {error}=await supabase.from('inventory_items').delete().eq('id',id); if(error) showToast('Failed to delete','error'); else { showToast('Product deleted'); setDeleteConfirm(null); loadItems(); } };
  const toggleFeatured = async (item: InventoryItem) => { const {error}=await supabase.from('inventory_items').update({featured:!item.featured}).eq('id',item.id); if(!error) setItems(prev=>prev.map(i=>i.id===item.id?{...i,featured:!i.featured}:i)); };
  const toggleSelectAll = () => { setSelectedIds(selectedIds.size===items.length?new Set():new Set(items.map(i=>i.id))); };
  const toggleSelect = (id: string) => { setSelectedIds(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;}); };
  const bulkAction = async (action: 'sold'|'available'|'featured'|'unfeatured'|'delete') => {
    if(selectedIds.size===0)return; const ids=Array.from(selectedIds);
    try {
      if(action==='delete'){await supabase.from('inventory_items').delete().in('id',ids);showToast(`Deleted ${ids.length} item(s)`);}
      else if(action==='sold'||action==='available'){const u:any={status:action};if(action==='sold')u.sold_at=new Date().toISOString();await supabase.from('inventory_items').update(u).in('id',ids);showToast(`Marked ${ids.length} as ${action}`);}
      else{await supabase.from('inventory_items').update({featured:action==='featured'}).in('id',ids);showToast(`Updated ${ids.length} item(s)`);}
      setSelectedIds(new Set());loadItems();
    }catch{showToast('Bulk action failed','error');}
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files=e.target.files; if(!files||!siteId)return; setUploading(true); const newImgs:string[]=[];
    for(const file of Array.from(files)){const ext=file.name.split('.').pop();const path=`${siteId}/inventory/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;const{error}=await supabase.storage.from('inventory-images').upload(path,file,{cacheControl:'3600',upsert:false});if(!error){const{data:u}=supabase.storage.from('inventory-images').getPublicUrl(path);if(u)newImgs.push(u.publicUrl);}}
    if(newImgs.length>0)setForm(p=>({...p,images:[...p.images,...newImgs],primary_image:p.primary_image||newImgs[0]}));
    setUploading(false);if(fileInputRef.current)fileInputRef.current.value='';
  };
  const removeImage=(url:string)=>{setForm(p=>({...p,images:p.images.filter(i=>i!==url),primary_image:p.primary_image===url?p.images.filter(i=>i!==url)[0]||null:p.primary_image}));};
  const addSpec=()=>{if(!newSpecKey.trim())return;setForm(p=>({...p,specifications:{...p.specifications,[newSpecKey.trim()]:newSpecValue.trim()}}));setNewSpecKey('');setNewSpecValue('');};
  const removeSpec=(key:string)=>{setForm(p=>{const s={...p.specifications};delete s[key];return{...p,specifications:s};});};
  const addCategory=async()=>{if(!newCategoryName.trim()||!siteId)return;const name=newCategoryName.trim();if(allCategories.includes(name))return;await supabase.from('inventory_categories').insert({site_id:siteId,name,slug:generateSlug(name),display_order:customCategories.length});setCustomCategories(p=>[...p,name]);setNewCategoryName('');};

  // CSV Import
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvMapping, setCsvMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0, errors: 0 });

  const CSV_FIELDS = [
    { key: 'title', label: 'Title', required: true },
    { key: 'description', label: 'Description' },
    { key: 'category', label: 'Category' },
    { key: 'condition', label: 'Condition' },
    { key: 'model', label: 'Model' },
    { key: 'year', label: 'Year' },
    { key: 'price', label: 'Price' },
    { key: 'sale_price', label: 'Sale Price' },
    { key: 'status', label: 'Status' },
    { key: 'stock_quantity', label: 'Stock Qty' },
    { key: 'sku', label: 'SKU' },
    { key: 'serial_number', label: 'Serial Number' },
    { key: 'hours', label: 'Hours' },
    { key: 'location', label: 'Location' },
    { key: 'primary_image', label: 'Image URL' },
  ];

  const parseCSV = (text: string): { headers: string[]; rows: Record<string, string>[] } => {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return { headers: [], rows: [] };
    // Detect delimiter
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] || ''; });
      return row;
    });
    return { headers, rows };
  };

  const handleCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { headers, rows } = parseCSV(text);
      setCsvHeaders(headers);
      setCsvData(rows);
      // Auto-map columns by matching names
      const autoMap: Record<string, string> = {};
      CSV_FIELDS.forEach(f => {
        const match = headers.find(h => h.toLowerCase().replace(/[^a-z]/g, '') === f.key.toLowerCase().replace(/[^a-z]/g, '')) 
          || headers.find(h => h.toLowerCase().includes(f.key.replace('_', ' ')))
          || headers.find(h => h.toLowerCase().includes(f.label.toLowerCase()));
        if (match) autoMap[f.key] = match;
      });
      setCsvMapping(autoMap);
      setImportModalOpen(true);
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const runImport = async () => {
    if (!siteId || csvData.length === 0) return;
    setImporting(true);
    setImportProgress({ done: 0, total: csvData.length, errors: 0 });
    let errors = 0;
    let updated = 0;
    let inserted = 0;

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const get = (key: string) => csvMapping[key] ? (row[csvMapping[key]] || '').trim() : '';
      const title = get('title');
      if (!title) { errors++; setImportProgress({ done: i + 1, total: csvData.length, errors }); continue; }

      const serialNumber = get('serial_number');

      // Check for existing item by serial number
      let existingItem: InventoryItem | null = null;
      if (serialNumber) {
        const { data } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('site_id', siteId)
          .eq('serial_number', serialNumber)
          .maybeSingle();
        existingItem = data;
      }

      if (existingItem) {
        // UPDATE — only fields that have non-empty values in CSV
        const updates: Record<string, any> = { updated_at: new Date().toISOString() };
        if (get('title')) updates.title = get('title');
        if (get('description')) updates.description = get('description');
        if (get('category')) updates.category = get('category');
        if (get('condition')) updates.condition = get('condition');
        if (get('model')) updates.model = get('model');
        if (get('year')) updates.year = parseInt(get('year'));
        if (get('price')) updates.price = parseFloat(get('price').replace(/[$,]/g, ''));
        if (get('sale_price')) updates.sale_price = parseFloat(get('sale_price').replace(/[$,]/g, ''));
        if (get('status')) updates.status = get('status');
        if (get('stock_quantity')) updates.stock_quantity = parseInt(get('stock_quantity'));
        if (get('sku')) updates.sku = get('sku');
        if (get('hours')) updates.hours = parseInt(get('hours'));
        if (get('location')) updates.location = get('location');
        if (get('primary_image')) {
          updates.primary_image = get('primary_image');
          // Merge new image into existing gallery without duplicates
          const existingImages = existingItem.images || [];
          if (!existingImages.includes(get('primary_image'))) {
            updates.images = [...existingImages, get('primary_image')];
          }
        }

        const { error } = await supabase
          .from('inventory_items')
          .update(updates)
          .eq('id', existingItem.id);
        if (error) errors++;
        else updated++;
      } else {
        // INSERT — new product
        const record = {
          site_id: siteId,
          title,
          description: get('description') || null,
          category: get('category') || 'Other',
          condition: get('condition') || 'new',
          model: get('model') || null,
          year: get('year') ? parseInt(get('year')) : null,
          price: get('price') ? parseFloat(get('price').replace(/[$,]/g, '')) : null,
          sale_price: get('sale_price') ? parseFloat(get('sale_price').replace(/[$,]/g, '')) : null,
          status: get('status') || 'available',
          stock_quantity: get('stock_quantity') ? parseInt(get('stock_quantity')) : 1,
          sku: get('sku') || null,
          serial_number: serialNumber || null,
          hours: get('hours') ? parseInt(get('hours')) : null,
          location: get('location') || null,
          primary_image: get('primary_image') || null,
          images: get('primary_image') ? [get('primary_image')] : [],
          specifications: {},
          featured: false,
          financing_available: false,
          display_order: 0,
          slug: generateSlug(title),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('inventory_items').insert([record]);
        if (error) errors++;
        else inserted++;
      }

      setImportProgress({ done: i + 1, total: csvData.length, errors });
    }

    setImporting(false);
    setImportModalOpen(false);
    setCsvData([]);
    setCsvHeaders([]);
    setCsvMapping({});

    const parts = [];
    if (inserted > 0) parts.push(`${inserted} added`);
    if (updated > 0) parts.push(`${updated} updated`);
    if (errors > 0) parts.push(`${errors} error(s)`);
    showToast(parts.join(', ') || 'Import complete', errors > 0 ? 'error' : 'success');
    loadItems();
  };

  const downloadTemplate = () => {
    const headers = CSV_FIELDS.map(f => f.label);
    const example = ['Toro TimeCutter 42" Zero Turn', 'Great condition zero turn mower', 'Mowers', 'new', '75742', '2026', '3499', '', 'available', '1', 'TORO-75742', '', '', 'Main Lot', ''];
    const csv = [headers.join(','), example.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'inventory-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportInventory = async () => {
    if (!siteId) return;
    showToast('Exporting inventory...');
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      showToast(error ? 'Export failed' : 'No products to export', 'error');
      return;
    }

    const escCsv = (val: any): string => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const headers = ['Title','Description','Category','Condition','Model','Year','Price','Sale Price','Status','Stock Qty','SKU','Serial Number','Hours','Location','Image URL'];
    const rows = data.map((item: any) => [
      escCsv(item.title),
      escCsv(item.description),
      escCsv(item.category),
      escCsv(item.condition),
      escCsv(item.model),
      escCsv(item.year),
      escCsv(item.price),
      escCsv(item.sale_price),
      escCsv(item.status),
      escCsv(item.stock_quantity),
      escCsv(item.sku),
      escCsv(item.serial_number),
      escCsv(item.hours),
      escCsv(item.location),
      escCsv(item.primary_image),
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${data.length} product${data.length !== 1 ? 's' : ''}`);
  };
  if (loading) return (<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>);

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (<div className={`fixed top-4 right-4 z-[200] flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${toast.type==='success'?'bg-emerald-600 text-white':'bg-red-600 text-white'}`}><span>{toast.type==='success'?'✓':'✕'}</span><span className="font-medium text-sm">{toast.message}</span></div>)}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={()=>router.push('/dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900"><ChevronLeft className="w-4 h-4" /><span className="text-sm font-medium">Dashboard</span></button>
            <div className="h-5 w-px bg-slate-300" />
            <div className="flex items-center gap-2"><Package className="w-5 h-5" style={{color:FM.orange}} /><h1 className="text-lg font-bold text-slate-800">Inventory Management</h1></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{totalCount} product{totalCount!==1?'s':''}</span>
            <button onClick={()=>{const url=`${window.location.origin}/api/feed/google-shopping/${siteId}`;navigator.clipboard.writeText(url);showToast('Feed URL copied to clipboard');}} className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg text-xs hover:bg-slate-50" title="Copy Google Shopping feed URL">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
              Google Feed
            </button>
            <button onClick={exportInventory} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50"><Download className="w-4 h-4" />Export CSV</button>
            <button onClick={()=>csvInputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50"><FileUp className="w-4 h-4" />Import CSV</button>
            <input ref={csvInputRef} type="file" accept=".csv,.tsv,.txt" onChange={handleCSVFile} className="hidden" />
            <button onClick={openAddModal} className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg text-sm" style={{background:FM.orange}}><Plus className="w-4 h-4" />Add Product</button>
          </div>
        </div>
      </div>
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="px-5 py-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e)=>{setSearchQuery(e.target.value);setPage(0);}} className="w-full pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2" style={{'--tw-ring-color':FM.navy} as any} />
              {searchQuery && <button onClick={()=>setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>}
            </div>
            <select value={filterCategory} onChange={(e)=>{setFilterCategory(e.target.value);setPage(0);}} className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white"><option value="">All Categories</option>{allCategories.map(c=><option key={c} value={c}>{c}</option>)}</select>
            <select value={filterStatus} onChange={(e)=>{setFilterStatus(e.target.value);setPage(0);}} className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white"><option value="">All Statuses</option>{STATUSES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select>
            <select value={filterCondition} onChange={(e)=>{setFilterCondition(e.target.value);setPage(0);}} className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white"><option value="">All Conditions</option>{CONDITIONS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select>
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button onClick={()=>setViewMode('list')} className={`p-2 ${viewMode==='list'?'bg-slate-100 text-slate-800':'text-slate-400'}`}><List className="w-4 h-4" /></button>
              <button onClick={()=>setViewMode('grid')} className={`p-2 ${viewMode==='grid'?'bg-slate-100 text-slate-800':'text-slate-400'}`}><Grid className="w-4 h-4" /></button>
            </div>
            <button onClick={()=>setCategoryModalOpen(true)} className="p-2 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg" title="Manage Categories"><FolderPlus className="w-4 h-4" /></button>
            {hasFilters && <button onClick={()=>{setSearchQuery('');setFilterCategory('');setFilterStatus('');setFilterCondition('');setPage(0);}} className="text-sm font-medium px-3 py-2 rounded-lg" style={{color:FM.orange}}>Clear filters</button>}
          </div>
          {selectedIds.size > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-4" style={{background:FM.orangeGlow}}>
              <span className="text-sm font-semibold" style={{color:FM.navy}}>{selectedIds.size} selected</span>
              <div className="flex gap-2">
                <button onClick={()=>bulkAction('sold')} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Mark Sold</button>
                <button onClick={()=>bulkAction('available')} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Mark Available</button>
                <button onClick={()=>bulkAction('featured')} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Feature</button>
                <button onClick={()=>bulkAction('unfeatured')} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Unfeature</button>
                <button onClick={()=>bulkAction('delete')} className="px-3 py-1.5 text-xs font-medium bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100">Delete</button>
              </div>
              <button onClick={()=>setSelectedIds(new Set())} className="ml-auto text-xs text-slate-500">Deselect all</button>
            </div>
          )}
        </div>

        {itemsLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{background:FM.orangeGlow}}><Package className="w-8 h-8" style={{color:FM.orange}} /></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{hasFilters?'No products match your filters':'No products yet'}</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">{hasFilters?"Try adjusting your search or filters.":'Add your first product to start building your online inventory.'}</p>
            {!hasFilters && <button onClick={openAddModal} className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-lg text-sm" style={{background:FM.orange}}><Plus className="w-4 h-4" />Add Your First Product</button>}
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-slate-100">
                <th className="pl-5 pr-2 py-3 w-10"><input type="checkbox" checked={selectedIds.size===items.length&&items.length>0} onChange={toggleSelectAll} className="rounded border-slate-300" /></th>
                <th className="px-3 py-3 w-16" />
                {([['title','Product'],['category','Category'],['price','Price'],['stock_quantity','Stock'],['status','Status'],['updated_at','Updated']] as [SortField,string][]).map(([f,l])=>(
                  <th key={f} className="px-3 py-3 text-left"><button onClick={()=>handleSort(f)} className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700">{l}{sortField===f?(sortDir==='asc'?<ArrowUp className="w-3 h-3" />:<ArrowDown className="w-3 h-3" />):<ArrowUpDown className="w-3 h-3 opacity-40" />}</button></th>
                ))}
                <th className="px-3 py-3 w-24" />
              </tr></thead>
              <tbody>{items.map(item=>(
                <tr key={item.id} className={`border-b border-slate-50 hover:bg-slate-50/60 ${selectedIds.has(item.id)?'bg-orange-50/40':''}`}>
                  <td className="pl-5 pr-2 py-3"><input type="checkbox" checked={selectedIds.has(item.id)} onChange={()=>toggleSelect(item.id)} className="rounded border-slate-300" /></td>
                  <td className="px-3 py-3"><div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">{item.primary_image?<img src={item.primary_image} alt="" className="w-full h-full object-cover" />:<ImageIcon className="w-5 h-5 text-slate-300" />}</div></td>
                  <td className="px-3 py-3"><div className="flex items-center gap-2"><span className="font-semibold text-sm text-slate-800">{item.title}</span>{item.featured&&<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}</div><div className="text-xs text-slate-500 mt-0.5">{[item.model,item.year,item.sku&&`SKU: ${item.sku}`].filter(Boolean).join(' · ')}</div></td>
                  <td className="px-3 py-3"><span className="text-sm text-slate-600">{item.category}</span><div className="mt-0.5"><ConditionBadge condition={item.condition} /></div></td>
                  <td className="px-3 py-3"><div className="text-sm font-semibold text-slate-800">{formatPrice(item.price)}</div>{item.sale_price&&<div className="text-xs text-red-500 font-medium">{formatPrice(item.sale_price)}</div>}</td>
                  <td className="px-3 py-3 text-sm text-slate-600">{item.stock_quantity}</td>
                  <td className="px-3 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-3 py-3 text-xs text-slate-400">{new Date(item.updated_at).toLocaleDateString()}</td>
                  <td className="px-3 py-3"><div className="flex items-center gap-1">
                    <button onClick={()=>toggleFeatured(item)} className="p-1.5 rounded-md hover:bg-slate-100">{item.featured?<Star className="w-4 h-4 fill-amber-400 text-amber-400" />:<StarOff className="w-4 h-4 text-slate-300" />}</button>
                    <button onClick={()=>openEditModal(item)} className="p-1.5 rounded-md hover:bg-slate-100"><Edit2 className="w-4 h-4 text-slate-400" /></button>
                    <button onClick={()=>setDeleteConfirm(item.id)} className="p-1.5 rounded-md hover:bg-red-50"><Trash2 className="w-4 h-4 text-slate-300 hover:text-red-500" /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map(item=>(
              <div key={item.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md cursor-pointer ${selectedIds.has(item.id)?'border-orange-300 ring-1 ring-orange-200':'border-slate-200'}`} onClick={()=>openEditModal(item)}>
                <div className="relative aspect-square bg-slate-100">
                  {item.primary_image?<img src={item.primary_image} alt="" className="w-full h-full object-cover" />:<div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-slate-200" /></div>}
                  {item.featured&&<div className="absolute top-2 left-2 bg-amber-400 text-white p-1 rounded-md"><Star className="w-3 h-3 fill-white" /></div>}
                  <div className="absolute top-2 right-2"><StatusBadge status={item.status} /></div>
                  <div className="absolute bottom-2 left-2"><input type="checkbox" checked={selectedIds.has(item.id)} onChange={(e)=>{e.stopPropagation();toggleSelect(item.id);}} className="rounded border-slate-300 bg-white/90" /></div>
                </div>
                <div className="p-3"><h3 className="font-semibold text-sm text-slate-800 truncate">{item.title}</h3><p className="text-xs text-slate-500 mt-0.5">{item.category}</p><p className="text-sm font-bold mt-1.5" style={{color:FM.navy}}>{formatPrice(item.price)}</p></div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-slate-500">Showing {page*PAGE_SIZE+1}–{Math.min((page+1)*PAGE_SIZE,totalCount)} of {totalCount}</span>
            <div className="flex gap-1">
              <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({length:Math.min(totalPages,7)},(_,i)=>{const pn=totalPages<=7?i:page<=3?i:page>=totalPages-4?totalPages-7+i:page-3+i;return <button key={pn} onClick={()=>setPage(pn)} className={`w-9 h-9 rounded-lg text-sm font-medium ${page===pn?'text-white':'border border-slate-200 text-slate-600 hover:bg-slate-50'}`} style={page===pn?{background:FM.navy}:{}}>{pn+1}</button>;})}
              <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-8 pb-8 overflow-y-auto">
          <div className="fixed inset-0 bg-black/40" onClick={()=>setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4" style={{maxHeight:'calc(100vh - 4rem)'}}>
            <div className="sticky top-0 bg-white border-b border-slate-100 rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-slate-800">{editingItem?'Edit Product':'Add Product'}</h2>
              <button onClick={()=>setModalOpen(false)} className="p-1 rounded-md hover:bg-slate-100"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="border-b border-slate-100 px-6 flex">
              {(['details','specs','images'] as const).map(tab=>(
                <button key={tab} onClick={()=>setActiveFormTab(tab)} className={`px-4 py-3 text-sm font-medium border-b-2 capitalize ${activeFormTab===tab?'':'border-transparent text-slate-400 hover:text-slate-600'}`} style={activeFormTab===tab?{borderColor:FM.navy,color:FM.navy}:{}}>{tab}</button>
              ))}
            </div>
            <div className="px-6 py-5 overflow-y-auto" style={{maxHeight:'calc(100vh - 16rem)'}}>
              {formError && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{formError}</div>}

              {/* Catalog Autofill — only for new items */}
              {!editingItem && (
                <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    <span className="text-sm font-semibold text-blue-900">Quick Add from Catalog</span>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium ml-1">Optional</span>
                  </div>

                  {catalogApplied ? (
                    <div className="flex items-center gap-3 bg-white border border-blue-200 rounded-lg p-2.5">
                      {catalogApplied.primary_image && <img src={catalogApplied.primary_image} alt="" className="w-10 h-10 object-cover rounded" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs text-slate-800 truncate">{catalogApplied.product_name}</div>
                        <div className="text-[10px] text-slate-500">{catalogApplied.manufacturer} · SKU: {catalogApplied.sku}</div>
                      </div>
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">Autofilled</span>
                      <button onClick={clearCatalogSelection} className="text-slate-400 hover:text-red-500 p-0.5"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-3.5 h-3.5" />
                        <input
                          type="text"
                          value={catalogQuery}
                          onChange={(e) => handleCatalogQueryChange(e.target.value)}
                          placeholder='Type a product name or SKU to autofill...'
                          className="w-full pl-9 pr-3 py-2 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                        />
                        {catalogSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /></div>}
                      </div>

                      {showCatalogResults && catalogResults.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-72 overflow-y-auto">
                          {catalogResults.map((product: any) => (
                            <button key={product.id} onClick={() => applyCatalogProduct(product)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 border-b border-slate-50 last:border-0 text-left transition-colors">
                              {product.primary_image ? (
                                <img src={product.primary_image} alt="" className="w-12 h-12 object-cover rounded flex-shrink-0" />
                              ) : (
                                <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center flex-shrink-0"><Package className="w-5 h-5 text-slate-400" /></div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-slate-800 truncate">{product.product_name}</div>
                                <div className="text-xs text-slate-500">
                                  {product.manufacturer} · SKU: {product.sku}
                                  {product.specs?.MSRP && <span className="ml-2 font-semibold text-green-700">MSRP {product.specs.MSRP}</span>}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}

                      {showCatalogResults && catalogResults.length === 0 && catalogQuery.length >= 2 && !catalogSearching && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-center">
                          <p className="text-xs text-slate-500">No catalog match for "{catalogQuery}" — fill in manually below</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeFormTab === 'details' && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label><input type="text" value={form.title} onChange={(e)=>uf('title',e.target.value)} placeholder='e.g. Toro TimeCutter Zero Turn' className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2" style={{'--tw-ring-color':FM.navy} as any} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Category</label><select value={form.category} onChange={(e)=>uf('category',e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white">{allCategories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Condition</label><select value={form.condition} onChange={(e)=>uf('condition',e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white">{CONDITIONS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Model</label><input type="text" value={form.model||''} onChange={(e)=>uf('model',e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Year</label><input type="number" value={form.year||''} onChange={(e)=>uf('year',e.target.value?parseInt(e.target.value):null)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Price</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="number" value={form.price??''} onChange={(e)=>uf('price',e.target.value?parseFloat(e.target.value):null)} placeholder="Leave blank for Call for Price" className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Sale Price</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="number" value={form.sale_price??''} onChange={(e)=>uf('sale_price',e.target.value?parseFloat(e.target.value):null)} className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label><select value={form.status} onChange={(e)=>uf('status',e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white">{STATUSES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Stock Qty</label><input type="number" value={form.stock_quantity} onChange={(e)=>uf('stock_quantity',parseInt(e.target.value)||0)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">SKU</label><input type="text" value={form.sku||''} onChange={(e)=>uf('sku',e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Serial #</label><input type="text" value={form.serial_number||''} onChange={(e)=>uf('serial_number',e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Hours</label><input type="number" value={form.hours??''} onChange={(e)=>uf('hours',e.target.value?parseInt(e.target.value):null)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea value={form.description||''} onChange={(e)=>uf('description',e.target.value)} rows={4} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm resize-none" placeholder="Describe the equipment..." /></div>
                  <div className="flex gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={(e)=>uf('featured',e.target.checked)} className="rounded border-slate-300" /><span className="text-sm text-slate-700">Featured product</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.financing_available} onChange={(e)=>uf('financing_available',e.target.checked)} className="rounded border-slate-300" /><span className="text-sm text-slate-700">Financing available</span></label>
                  </div>
                </div>
              )}
              {activeFormTab === 'specs' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Add specs like engine size, deck width, weight, etc.</p>
                  {Object.entries(form.specifications).map(([key,val])=>(<div key={key} className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3"><span className="text-sm font-medium text-slate-700 flex-1">{key}</span><span className="text-sm text-slate-600 flex-1">{val}</span><button onClick={()=>removeSpec(key)} className="p-1 hover:bg-red-50 rounded"><X className="w-4 h-4 text-slate-400 hover:text-red-500" /></button></div>))}
                  <div className="flex gap-3">
                    <input type="text" placeholder="Spec name" value={newSpecKey} onChange={(e)=>setNewSpecKey(e.target.value)} className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm" />
                    <input type="text" placeholder="Value" value={newSpecValue} onChange={(e)=>setNewSpecValue(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&addSpec()} className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm" />
                    <button onClick={addSpec} disabled={!newSpecKey.trim()} className="px-4 py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-40" style={{background:FM.navy}}>Add</button>
                  </div>
                  <div><p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Quick add</p><div className="flex flex-wrap gap-2">{['Engine','Deck Size','Horsepower','Weight','Fuel Type','Drive Type','Cutting Width','Transmission'].map(spec=>(!form.specifications[spec]&&<button key={spec} onClick={()=>setNewSpecKey(spec)} className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">+ {spec}</button>))}</div></div>
                </div>
              )}
              {activeFormTab === 'images' && (
                <div className="space-y-4">
                  <div onClick={()=>fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-slate-300">
                    {uploading?<Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />:<Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />}
                    <p className="text-sm font-medium text-slate-600">{uploading?'Uploading...':'Click to upload images'}</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP up to 10MB each</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  {form.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">{form.images.map((url,i)=>(
                      <div key={i} className={`relative rounded-lg overflow-hidden border-2 ${form.primary_image===url?'border-amber-400':'border-transparent'}`}>
                        <img src={url} alt="" className="w-full aspect-square object-cover" />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                          <button onClick={()=>uf('primary_image',url)} className="p-1.5 bg-white rounded-md"><Star className={`w-4 h-4 ${form.primary_image===url?'fill-amber-400 text-amber-400':'text-slate-600'}`} /></button>
                          <button onClick={()=>removeImage(url)} className="p-1.5 bg-white rounded-md"><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                        {form.primary_image===url && <div className="absolute top-1 left-1 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">PRIMARY</div>}
                      </div>
                    ))}</div>
                  )}
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-100 rounded-b-2xl px-6 py-4 flex items-center justify-between">
              <button onClick={()=>setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50 flex items-center gap-2" style={{background:FM.orange}}>{saving&&<Loader2 className="w-4 h-4 animate-spin" />}{editingItem?'Update Product':'Add Product'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={()=>setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4">
            <h3 className="font-bold text-slate-800 mb-2">Delete Product?</h3>
            <p className="text-sm text-slate-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={()=>setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={()=>handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      {categoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={()=>setCategoryModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Manage Categories</h2>
              <button onClick={()=>setCategoryModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-md"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Default Categories</p>
              <div className="flex flex-wrap gap-2 mb-5">{CATEGORIES.map(c=><span key={c} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">{c}</span>)}</div>
              {customCategories.length > 0 && (<>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Custom Categories</p>
                <div className="space-y-2 mb-5">{customCategories.map(c=>(
                  <div key={c} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2.5">
                    <span className="text-sm font-medium text-slate-700">{c}</span>
                    <button onClick={async()=>{await supabase.from('inventory_categories').delete().eq('site_id',siteId).eq('name',c);setCustomCategories(p=>p.filter(x=>x!==c));}} className="p-1 hover:bg-red-50 rounded"><X className="w-4 h-4 text-slate-400 hover:text-red-500" /></button>
                  </div>
                ))}</div>
              </>)}
              <div className="flex gap-2">
                <input type="text" placeholder="New category name..." value={newCategoryName} onChange={(e)=>setNewCategoryName(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&addCategory()} className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm" />
                <button onClick={addCategory} disabled={!newCategoryName.trim()} className="px-4 py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-40" style={{background:FM.navy}}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {importModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-8 pb-8 overflow-y-auto">
          <div className="fixed inset-0 bg-black/40" onClick={()=>{if(!importing){setImportModalOpen(false);setCsvData([]);setCsvHeaders([]);setCsvMapping({});}}} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Import from CSV</h2>
                <p className="text-sm text-slate-500 mt-0.5">{csvData.length} row{csvData.length!==1?'s':''} found · {Object.values(csvMapping).filter(Boolean).length} of {CSV_FIELDS.length} fields mapped</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={downloadTemplate} className="text-xs font-medium px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-1"><Download className="w-3 h-3" />Template</button>
                {!importing && <button onClick={()=>{setImportModalOpen(false);setCsvData([]);setCsvHeaders([]);setCsvMapping({});}} className="p-1 hover:bg-slate-100 rounded-md"><X className="w-5 h-5 text-slate-400" /></button>}
              </div>
            </div>
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              {importing ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{color:FM.orange}} />
                  <p className="font-semibold text-slate-800 mb-1">Importing products...</p>
                  <p className="text-sm text-slate-500">{importProgress.done} of {importProgress.total} processed</p>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-4 max-w-xs mx-auto">
                    <div className="h-2 rounded-full transition-all" style={{width:`${(importProgress.done/importProgress.total)*100}%`,background:FM.orange}} />
                  </div>
                  {importProgress.errors > 0 && <p className="text-xs text-red-500 mt-2">{importProgress.errors} error(s)</p>}
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-600 mb-1">Map your CSV columns to inventory fields.</p>
                  <p className="text-xs text-slate-400 mb-4">Items with matching <strong>Serial Numbers</strong> will be updated. New serial numbers will be added.</p>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200">
                    {CSV_FIELDS.map(field => {
                      const isMapped = !!csvMapping[field.key];
                      const preview = isMapped && csvData[0] ? csvData[0][csvMapping[field.key]] : '';
                      return (
                        <div key={field.key} className={`flex items-center gap-3 px-4 py-2.5 ${isMapped ? 'bg-white' : ''}`}>
                          <div className="w-8 flex justify-center">
                            {isMapped ? (
                              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{background: FM.orange + '18', color: FM.orange}}>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                            )}
                          </div>
                          <label className="w-28 text-sm font-medium text-slate-700 flex-shrink-0">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-0.5">*</span>}
                          </label>
                          <div className="flex-1 relative">
                            <select
                              value={csvMapping[field.key] || ''}
                              onChange={(e) => setCsvMapping(prev => ({...prev, [field.key]: e.target.value}))}
                              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white appearance-none cursor-pointer transition-colors ${
                                isMapped
                                  ? 'border-slate-300 text-slate-800 font-medium'
                                  : 'border-slate-200 text-slate-400'
                              }`}
                              style={isMapped ? {borderColor: FM.orange + '60'} : {}}
                            >
                              <option value="">— Skip —</option>
                              {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 rotate-90 pointer-events-none" />
                          </div>
                          <div className="w-36 flex-shrink-0">
                            {preview ? (
                              <span className="text-xs text-slate-400 truncate block" title={preview}>
                                {preview.length > 24 ? preview.slice(0, 24) + '…' : preview}
                              </span>
                            ) : isMapped ? (
                              <span className="text-xs text-slate-300 italic">empty</span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Preview */}
                  {csvData.length > 0 && csvMapping.title && (
                    <div className="mt-5">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Preview (first 3 rows)</p>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-slate-50">{['Title','Category','Price','Serial #','Status'].map(h=><th key={h} className="px-3 py-2.5 text-left font-semibold text-slate-500">{h}</th>)}</tr></thead>
                          <tbody>{csvData.slice(0,3).map((row,i)=>(
                            <tr key={i} className="border-t border-slate-100">
                              <td className="px-3 py-2.5 text-slate-800 font-medium">{csvMapping.title?row[csvMapping.title]:'—'}</td>
                              <td className="px-3 py-2.5 text-slate-600">{csvMapping.category?row[csvMapping.category]:'Other'}</td>
                              <td className="px-3 py-2.5 text-slate-600">{csvMapping.price?('$'+row[csvMapping.price]):'—'}</td>
                              <td className="px-3 py-2.5 text-slate-600 font-mono">{csvMapping.serial_number?row[csvMapping.serial_number]:'—'}</td>
                              <td className="px-3 py-2.5"><StatusBadge status={csvMapping.status?row[csvMapping.status]:'available'} /></td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {!importing && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
                <button onClick={()=>{setImportModalOpen(false);setCsvData([]);setCsvHeaders([]);setCsvMapping({});}} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button onClick={runImport} disabled={!csvMapping.title || csvData.length===0} className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-40 flex items-center gap-2" style={{background:FM.orange}}>
                  <FileUp className="w-4 h-4" />
                  Import {csvData.length} Product{csvData.length!==1?'s':''}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
