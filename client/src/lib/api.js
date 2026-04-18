const BASE = '/api';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Request failed');
  return json;
}

export const api = {
  info:          ()       => get('/info'),
  getGeneral:    ()       => get('/general'),
  getAnimations: ()       => get('/animations'),
  getBinds:      ()       => get('/binds'),
  getVariables:  ()       => get('/variables'),
  search:        (q)      => get(`/search?q=${encodeURIComponent(q)}`),
  getFiles:      ()       => get('/files'),
  getFile:       (fp)     => get(`/file?path=${encodeURIComponent(fp)}`),
  getRaw:        (file)   => get(`/raw/${file}`),
};
