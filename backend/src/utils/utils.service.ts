import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from 'src/clients/elasticsearch.service';
@Injectable()
export class UtilsService {
    constructor(private readonly indexService: ElasticsearchService) {}
    private HISTORY_INDEX = process.env.KIBA_INDEX_PREFIX + '-history';
    public  getValue(obj: any, path: string) {
        if (obj == null) return undefined;
    
        // 1) Essai de clé exacte au niveau courant
        if (Object.prototype.hasOwnProperty.call(obj, path)) {
          return obj[path];
        }
    
        const parts = path.split('.');
        let cur: any = obj;
    
        for (let i = 0; i < parts.length; i++) {
          if (cur == null) return undefined;
    
          // 2) À chaque étape, tenter la "clé restante" littérale (gère 'kibana.alert.reason')
          const rest = parts.slice(i).join('.');
          if (Object.prototype.hasOwnProperty.call(cur, rest)) {
            return cur[rest];
          }
    
          // 3) Sinon descendre normalement
          const part = parts[i];
          if (Array.isArray(cur) && /^\d+$/.test(part)) {
            cur = cur[Number(part)];
          } else {
            cur = cur[part];
          }
        }
        return cur;

      }
async replacePlaceholders(template: string, data: any) {
   
    return template.replace(/{([^}]+)}/g, (_, rawPath) => {
      const v = this.getValue(data, rawPath);
      if (v === undefined || v === null) return `{${rawPath}}`; // laisse le placeholder si non trouvé
      return typeof v === 'object' ? JSON.stringify(v) : String(v);
    });
  }
  async replaceInternalPlaceholders(template: string, alert: any) {
    return template.replace(/{vars\.(\w+)}/g, (_, key) => {
      const value = this.getValue(alert, key);
      return value !== undefined ? String(value) : `{alert.${key}}`;
    });
  }
  async esLoggingHistory( message: string, meta: any = {}) {
    const logEntry = {
      message,
      meta,
      timestamp: new Date().toISOString(),
    };
    // Envoyer le log à Elasticsearch
    await this.indexService.index(this.HISTORY_INDEX, logEntry);
  }
}