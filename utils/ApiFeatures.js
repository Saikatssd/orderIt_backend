
class APIFeatures {
    constructor(query, queryStr) {
      this.query = query;
      this.queryStr = queryStr;
    }
  
    search() {
      const keyword = this.queryStr.keyword
        ? {
            name: {
              $regex: this.queryStr.keyword,
              $options: "i",
            },
          }
        : {};
      this.query = this.query.find({ ...keyword });
      return this;
    }
  
    filter() {
      const queryCopy = { ...this.queryStr };
  
      // Fields to exclude
      const removeFields = ["keyword", "limit", "page"];
      removeFields.forEach((el) => delete queryCopy[el]);
  
      // Advanced filter for price, ratings etc.
      let queryStr = JSON.stringify(queryCopy);
      queryStr = queryStr.replace(
        /\b(gt|gte|lt|lte)\b/g,
        (match) => `$${match}`
      );
  
      this.query = this.query.find(JSON.parse(queryStr));
  
      // Sorting
      if (this.queryStr.sortBy) {
        const sortQuery = this.queryStr.sortBy.toLowerCase();
        let sortOptions = {};
        if (sortQuery === "ratings") sortOptions = { ratings: -1 };
        else if (sortQuery === "reviews") sortOptions = { numOfReviews: -1 };
        this.query = this.query.sort(sortOptions);
      }
  
      return this;
    }
  
    pagination(resultsPerPage) {
      const currentPage = Number(this.queryStr.page) || 1;
      const skip = resultsPerPage * (currentPage - 1);
      this.query = this.query.limit(resultsPerPage).skip(skip);
      return this;
    }
  
    sort() {
      if (this.queryStr.sortBy) {
        const sortQuery = this.queryStr.sortBy.toLowerCase();
        let sortOptions = {};
        if (sortQuery === "ratings") sortOptions = { ratings: -1 };
        else if (sortQuery === "reviews") sortOptions = { numOfReviews: -1 };
        this.query = this.query.sort(sortOptions);
      }
      return this;
    }
  }
  
  module.exports = APIFeatures;
  