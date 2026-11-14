"""Práctica local, sin redes ni credenciales. Python 3, biblioteca estándar."""
import argparse,json,sqlite3

def connect(path):
    db=sqlite3.connect(path)
    db.execute('PRAGMA foreign_keys=ON')
    db.executescript('''
    CREATE TABLE IF NOT EXISTS events(event_id TEXT PRIMARY KEY,entity_id TEXT NOT NULL,type TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS contacts(entity_id TEXT PRIMARY KEY,opted_out INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS jobs(action_key TEXT PRIMARY KEY,entity_id TEXT NOT NULL,state TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,last_error TEXT);
    CREATE TABLE IF NOT EXISTS effects(action_key TEXT PRIMARY KEY,entity_id TEXT NOT NULL);
    ''')
    return db

def ingest(db,events):
    accepted=duplicates=0
    for e in events:
        if not isinstance(e,dict) or set(e)!={'event_id','entity_id','type'}:raise ValueError('Cada evento requiere event_id, entity_id y type.')
        if any(not isinstance(e[k],str) or not e[k] or len(e[k])>80 for k in e):raise ValueError('Campos no válidos.')
        if e['type'] not in ('lead_created','contact_opted_out'):raise ValueError('Tipo no permitido.')
        with db:
            old=db.execute('SELECT entity_id,type FROM events WHERE event_id=?',(e['event_id'],)).fetchone()
            if old:
                if old!=(e['entity_id'],e['type']):raise ValueError('Conflicto: un event_id no puede cambiar de significado.')
                duplicates+=1;continue
            db.execute('INSERT INTO events VALUES(?,?,?)',(e['event_id'],e['entity_id'],e['type']))
            db.execute('INSERT OR IGNORE INTO contacts(entity_id) VALUES(?)',(e['entity_id'],))
            if e['type']=='contact_opted_out':
                db.execute('UPDATE contacts SET opted_out=1 WHERE entity_id=?',(e['entity_id'],))
                db.execute("UPDATE jobs SET state='cancelled' WHERE entity_id=? AND state='pending'",(e['entity_id'],))
            else:
                opted=db.execute('SELECT opted_out FROM contacts WHERE entity_id=?',(e['entity_id'],)).fetchone()[0]
                db.execute('INSERT OR IGNORE INTO jobs(action_key,entity_id,state) VALUES(?,?,?)',(e['entity_id']+':welcome:v1',e['entity_id'],'cancelled' if opted else 'pending'))
            accepted+=1
    return dict(accepted=accepted,duplicate_deliveries=duplicates)

def run(db,fail_once=None):
    keys=[r[0] for r in db.execute("SELECT action_key FROM jobs WHERE state='pending' ORDER BY action_key")]
    for key in keys:
        with db:
            # Single SQLite writer lock; state is checked again inside transaction.
            db.execute('BEGIN IMMEDIATE')
            entity,state,attempts=db.execute('SELECT entity_id,state,attempts FROM jobs WHERE action_key=?',(key,)).fetchone()
            if state!='pending':continue
            db.execute('UPDATE jobs SET attempts=attempts+1 WHERE action_key=?',(key,))
            if db.execute('SELECT opted_out FROM contacts WHERE entity_id=?',(entity,)).fetchone()[0]:
                db.execute("UPDATE jobs SET state='cancelled' WHERE action_key=?",(key,));continue
            if entity==fail_once and attempts==0:
                db.execute("UPDATE jobs SET last_error='temporary simulated failure' WHERE action_key=?",(key,));continue
            # The effect is local and in the SAME transaction, unlike an external API.
            db.execute('INSERT OR IGNORE INTO effects VALUES(?,?)',(key,entity))
            db.execute("UPDATE jobs SET state='done',last_error=NULL WHERE action_key=?",(key,))

def report(db):
    return dict(unique_events=db.execute('SELECT COUNT(*) FROM events').fetchone()[0],contacts=[dict(entity_id=r[0],opted_out=bool(r[1])) for r in db.execute('SELECT * FROM contacts ORDER BY entity_id')],jobs=[dict(action_key=r[0],entity_id=r[1],state=r[2],attempts=r[3],last_error=r[4]) for r in db.execute('SELECT * FROM jobs ORDER BY action_key')],effects=[r[0] for r in db.execute('SELECT action_key FROM effects ORDER BY action_key')])

DEMO=[dict(event_id=a,entity_id=b,type=c) for a,b,c in [('E1','L1','lead_created'),('E1','L1','lead_created'),('E2','L2','lead_created'),('E3','L2','contact_opted_out'),('E4','L3','lead_created')]]
def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('command',choices=['demo','ingest','run','report']);parser.add_argument('file',nargs='?');parser.add_argument('--db',default='practica.sqlite');parser.add_argument('--fail-once');args=parser.parse_args();db=connect(args.db)
    try:
        if args.command=='demo':print(json.dumps(ingest(db,DEMO),ensure_ascii=False));run(db,'L3');run(db)
        if args.command=='ingest':
            if not args.file:parser.error('ingest requiere un archivo JSONL')
            with open(args.file,encoding='utf8') as f:events=[json.loads(line) for line in f if line.strip()]
            print(json.dumps(ingest(db,events),ensure_ascii=False))
        if args.command=='run':run(db,args.fail_once)
        print(json.dumps(report(db),ensure_ascii=False,indent=2))
    finally:db.close()
if __name__=='__main__':main()
