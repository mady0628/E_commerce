export const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatOrderDateLabel = (dateValue) => {
  return `Ngày ${new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date(dateValue))}`;
};

export const getOrderDateKey = (dateValue) => {
  const date = new Date(dateValue);
  return date.toISOString().slice(0, 10);
};

export const groupOrdersByDate = (orders = []) => {
  const groups = orders.reduce((acc, order) => {
    if (!order.createdAt) {
      return acc;
    }

    const key = getOrderDateKey(order.createdAt);

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(order);
    return acc;
  }, {});

  return Object.entries(groups).sort((a, b) => {
    const dateA = a[1][0]?.createdAt ? new Date(a[1][0].createdAt).getTime() : 0;
    const dateB = b[1][0]?.createdAt ? new Date(b[1][0].createdAt).getTime() : 0;
    return dateB - dateA;
  });
};

export const getPrimaryImage = (image) => {
  if (Array.isArray(image)) return image.find(Boolean);
  return image;
};
