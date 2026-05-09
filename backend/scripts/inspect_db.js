import Database from 'better-sqlite3';
const db = new Database('database.sqlite');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tabelas:', tables);

tables.forEach(table => {
    if (table.name === 'sqlite_sequence') return;
    const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
    console.log(`\nColunas da tabela ${table.name}:`);
    console.table(columns);
    
    const count = db.prepare(`SELECT COUNT(*) as total FROM ${table.name}`).get();
    console.log(`Total de registros: ${count.total}`);
});
