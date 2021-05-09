module.exports = {
    isOwner:function(req, res) {
        console.log(req.user);
        if(req.user) {
            return true;
        } else {
            return false;
        }
    }
}