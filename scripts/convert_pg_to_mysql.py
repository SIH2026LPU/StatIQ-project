import re
import subprocess
import os

def pg_to_mysql_sql(pg_sql: str) -> str:
    mysql_lines = [
        "-- StatIQ AI MySQL Database Schema",
        "-- Auto-generated for MySQL 8+",
        "DROP DATABASE IF EXISTS `statiq_db`;",
        "CREATE DATABASE `statiq_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
        "USE `statiq_db`;",
        "SET FOREIGN_KEY_CHECKS = 0;",
        ""
    ]
    
    # Split statements
    statements = pg_sql.split('--> statement-breakpoint')
    for stmt in statements:
        s = stmt.strip()
        if not s or s.startswith('SET search_path'):
            continue
            
        # Remove "public". or `public`. references
        s = re.sub(r'[`"]?public[`"]?\.', '', s)
            
        # Convert identifiers "col" -> `col`
        s = re.sub(r'"([^"]+)"', r'`\1`', s)
        
        # Convert types
        s = re.sub(r'\btimestamp with time zone\b', 'DATETIME', s, flags=re.IGNORECASE)
        s = re.sub(r'\btimestamp without time zone\b', 'DATETIME', s, flags=re.IGNORECASE)
        s = re.sub(r'\btimestamp\b', 'DATETIME', s, flags=re.IGNORECASE)
        s = re.sub(r'\bjsonb\b', 'JSON', s, flags=re.IGNORECASE)
        s = re.sub(r'\breal\b', 'DOUBLE', s, flags=re.IGNORECASE)
        s = re.sub(r'\bboolean\b', 'TINYINT(1)', s, flags=re.IGNORECASE)
        s = re.sub(r'\bDEFAULT now\(\)', 'DEFAULT CURRENT_TIMESTAMP', s, flags=re.IGNORECASE)
        s = re.sub(r'\bDEFAULT true\b', 'DEFAULT 1', s, flags=re.IGNORECASE)
        s = re.sub(r'\bDEFAULT false\b', 'DEFAULT 0', s, flags=re.IGNORECASE)
        
        # Specific columns that are indexed: change `text` to `varchar(255)`
        s = re.sub(r'(`external_id`)\s+text', r'\1 varchar(255)', s)
        s = re.sub(r'(`token_hash`)\s+text', r'\1 varchar(255)', s)
        s = re.sub(r'(`session_token_hash`)\s+text', r'\1 varchar(255)', s)
        s = re.sub(r'(`idempotency_key`)\s+text', r'\1 varchar(255)', s)
        
        # Convert index syntax: ON `table` USING btree (`col1`, `col2`) -> ON `table` (`col1`, `col2`)
        s = re.sub(r'\bUSING\s+btree\s+', '', s, flags=re.IGNORECASE)
        
        # Clean up any trailing semicolon if needed
        s = s.rstrip(';') + ';'
        mysql_lines.append(s)
        mysql_lines.append("")
        
    mysql_lines.append("SET FOREIGN_KEY_CHECKS = 1;")
    return '\n'.join(mysql_lines)

def main():
    pg_file = "/Users/harshsharma/Downloads/StatIQ-project-main/temp_recovery.sql"
    with open(pg_file, "r") as f:
        pg_sql = f.read()
        
    mysql_sql = pg_to_mysql_sql(pg_sql)
    
    out_file = "/Users/harshsharma/Downloads/StatIQ-project-main/scripts/mysql_schema.sql"
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w") as f:
        f.write(mysql_sql)
        
    print(f"Generated {out_file} successfully.")
    
if __name__ == "__main__":
    main()
