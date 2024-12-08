const Shop = require('../models/Shop'); // Assuming Shop is your shop model

const getOwnerByShopId = async (req, res) => {
    const { shopId } = req.params;
    try {
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        return res.json({ ownerId: shop.ownerId });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

module.exports = { getOwnerByShopId };
