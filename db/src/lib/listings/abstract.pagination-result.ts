export class Pagination<Entity> {
    public results: Entity[];
    public total: number;
  
    constructor(paginationResults: { results: Entity[]; total: number }) {
      this.results = paginationResults.results;
      this.total = paginationResults.total;
    }
  }