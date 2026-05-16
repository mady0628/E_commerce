import DashboardPanel from './DashboardPanel';
import UsersPanel from './UsersPanel';
import ProductsPanel from './ProductsPanel';
import OrdersPanel from './OrdersPanel';
import CommentsPanel from './CommentsPanel';

function AdminContent({
  activeTab,
  orders,
  users,
  userSearchTerm,
  setUserSearchTerm,
  fetchUsers,
  handleDeleteUser,
  products,
  productSearchTerm,
  setProductSearchTerm,
  fetchProducts,
  productPagination,
  loadingMoreProducts,
  handleLoadMoreProducts,
  newProduct,
  setNewProduct,
  editingProductId,
  handleSaveProduct,
  handleCancelEdit,
  handleEditProduct,
  handleDeleteProduct,
  orderSearchTerm,
  setOrderSearchTerm,
  fetchOrders,
  handleUpdateOrderStatus,
  selectedProductForComments,
  handleSelectProductForComments,
  handleBackToProductList,
  loadingComments,
  comments,
  handleToggleCommentVisibility,
}) {
  switch (activeTab) {
    case 'dashboard':
      return <DashboardPanel orders={orders} />;
    case 'user':
      return (
        <UsersPanel
          users={users}
          userSearchTerm={userSearchTerm}
          setUserSearchTerm={setUserSearchTerm}
          fetchUsers={fetchUsers}
          handleDeleteUser={handleDeleteUser}
        />
      );
    case 'product':
      return (
        <ProductsPanel
          products={products}
          productSearchTerm={productSearchTerm}
          setProductSearchTerm={setProductSearchTerm}
          fetchProducts={fetchProducts}
          productPagination={productPagination}
          loadingMoreProducts={loadingMoreProducts}
          handleLoadMoreProducts={handleLoadMoreProducts}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          editingProductId={editingProductId}
          handleSaveProduct={handleSaveProduct}
          handleCancelEdit={handleCancelEdit}
          handleEditProduct={handleEditProduct}
          handleDeleteProduct={handleDeleteProduct}
        />
      );
    case 'order':
      return (
        <OrdersPanel
          orders={orders}
          orderSearchTerm={orderSearchTerm}
          setOrderSearchTerm={setOrderSearchTerm}
          fetchOrders={fetchOrders}
          handleUpdateOrderStatus={handleUpdateOrderStatus}
        />
      );
    case 'comment':
      return (
        <CommentsPanel
          products={products}
          selectedProductForComments={selectedProductForComments}
          handleSelectProductForComments={handleSelectProductForComments}
          handleBackToProductList={handleBackToProductList}
          loadingComments={loadingComments}
          comments={comments}
          handleToggleCommentVisibility={handleToggleCommentVisibility}
        />
      );
    default:
      return null;
  }
}

export default AdminContent;
