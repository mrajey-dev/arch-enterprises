<template>
  <div class="offer-list-container">

    <div class="list-header">
      <h2>All Offer Letters</h2>
      <span class="count-badge">
        Total: {{ offers.length }}
      </span>
    </div>

    <div class="table-wrapper" v-if="offers.length > 0">
      <table class="styled-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Candidate</th>
            <th>Position</th>
            <th>Salary</th>
            <th>Joining Date</th>
            <th>Work Type</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(offer, index) in offers" :key="offer.id">
            <td>{{ index + 1 }}</td>
            <td>{{ offer.name }}</td>
            <td>{{ offer.position }}</td>
            <td>₹{{ offer.salary }}</td>
            <td>{{ offer.joining_date }}</td>
            <td>
              <span class="type-badge" :class="offer.work_type.toLowerCase()">
                {{ offer.work_type }}
              </span>
            </td>
            <td>{{ formatDate(offer.created_at) }}</td>
            <td>
  <button class="view-btn" @click="viewOffer(offer.id)">
    View
  </button>
</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      No Offer Letters Created Yet
    </div>

  </div>
</template>

<script>
import axios from "axios"

export default {
  data() {
    return {
      offers: []
    }
  },
methods: {
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-GB')
  },
    viewOffer(id) {
    this.$router.push(`/OfferLetter/${id}`)
  }
},
  async mounted() {
    try {
      const response = await axios.get(
        "https://employees.archenterprises.co.in/api/api/offer-letters"
      )

      console.log("API DATA:", response.data)

      this.offers = response.data
    } catch (error) {
      console.error("API ERROR:", error)
    }
  }
}
</script>

<style>
.offer-list-container {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.05);
}

/* Header */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.count-badge {
  background: #0d6efd;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.styled-table thead {
  background: #f8f9fa;
}

.styled-table th {
  text-align: left;
  padding: 12px;
  font-weight: 600;
  color: #444;
}

.styled-table td {
  padding: 12px;
  border-top: 1px solid #eee;
}

.styled-table tbody tr {
  transition: 0.2s ease;
}

.styled-table tbody tr:hover {
  background: #f5f9ff;
}

/* Work Type Badges */
.type-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  color: white;
}

.type-badge.onsite {
  background: #198754;
}

.type-badge.remote {
  background: #0d6efd;
}

.type-badge.hybrid {
  background: #fd7e14;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px;
  color: #888;
}
.view-btn {
  background: #0d6efd;
  border: none;
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s ease;
}

.view-btn:hover {
  background: #0b5ed7;
}

</style>