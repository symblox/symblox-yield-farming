pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./SymbloxToken.sol";

// Copied and modified from SUSHI code:
// https://github.com/sushiswap/sushiswap/blob/master/contracts/MasterChef.sol
//
// Note that it's ownable and the owner wields tremendous power. The ownership
// will be transferred to a governance smart contract once Symblox is sufficiently
// distributed and the community can show to govern itself.
//
contract RewardManager is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many LP tokens the user has provided.
        int256 rewardDebt; // Reward debt. See explanation below.
        //
        // We do some fancy math here. Basically, any point in time, the amount of Symblox
        // entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * pool.accSyxPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
        //   1. The pool's `accSyxPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }

    // Info of each pool.
    struct PoolInfo {
        IERC20 lpToken; // Address of LP token contract.
        uint256 allocPoint; // How many allocation points assigned to this pool. syX is distributed per block.
        uint256 lastRewardBlock; // Last block number that syX distribution occurs.
        uint256 accSyxPerShare; // Accumulated syX per share, times 1e12. See below.
    }

    // The REWARD TOKEN!
    SymbloxToken public syx;
    // Dev address.
    address public devaddr;
    // Dev pending reward
    uint256 public devPending;
    // Block number when bonus syX period ends.
    uint256 public bonusEndBlock;
    uint256 public syxPerBlock;
    // Bonus muliplier for early syx makers.
    uint256 public constant BONUS_MULTIPLIER = 3;

    // Info of each pool.
    PoolInfo[] public poolInfo;
    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    // Total allocation points. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;
    // The block number when Symblox mining starts.
    uint256 public startBlock;
    // Reward deadline block
    uint256 public endBlock = 0;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );

    modifier validPool(uint256 _pid) {
        require(_pid < poolInfo.length, "pool existed.");
        _;
    }

    constructor(
        address _syx,
        address _devaddr,
        uint256 _startBlock,
        uint256 _endBlock,
        uint256 _bonusEndBlock,
        uint256 _initSupply
    ) public {
        syx = SymbloxToken(_syx);
        devaddr = _devaddr;
        startBlock = _startBlock;
        endBlock = _endBlock;
        bonusEndBlock = _bonusEndBlock;
        uint256 seasonBlocks = _endBlock.sub(_startBlock);
        syxPerBlock = _initSupply.mul(9).div(10).div(seasonBlocks); //90%, 10% to devaddr
    }

    /**
     * Admin functions
     */
    // Add a new lp to the pool. Can only be called by the owner.
    // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.
    function add(
        uint256 _allocPoint,
        IERC20 _lpToken,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        checkDuplicatePool(_lpToken);
        uint256 lastRewardBlock = block.number > startBlock
            ? block.number
            : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(
            PoolInfo({
                lpToken: _lpToken,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accSyxPerShare: 0
            })
        );
    }

    // Update the given pool's Symblox allocation point. Can only be called by the owner.
    function set(
        uint256 _pid,
        uint256 _allocPoint,
        bool _withUpdate
    ) public validPool(_pid) onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(
            _allocPoint
        );
        poolInfo[_pid].allocPoint = _allocPoint;
    }

    /**
     * State-update functions
     */

    // Update reward vairables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid) public validPool(_pid) {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 syxReward = multiplier
            .mul(syxPerBlock)
            .mul(pool.allocPoint)
            .div(totalAllocPoint);

        pool.lastRewardBlock = block.number;

        uint256 syxBal = syx.balanceOf(address(this));
        uint256 devReward = syxReward.div(9).add(devPending);
        if (devReward > syxBal) {
            devPending = devReward.sub(syxBal);
            syx.transfer(devaddr, syxBal);
        } else {
            devPending = 0;
            syx.transfer(devaddr, devReward);
        }

        pool.accSyxPerShare = pool.accSyxPerShare.add(
            syxReward.mul(1e12).div(lpSupply)
        );
    }

    /**
     * Deposit LP tokens to RewardManager for Symblox allocation.
     * @param _pid Reward pool Id
     * @param _amount Amount of LP tokens to deposit
     * @return Total amount of the user's LP tokens
     */
    function deposit(uint256 _pid, uint256 _amount)
        public
        validPool(_pid)
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        uint256 prevAmount = user.amount;
        int256 prevRewardDebt = user.rewardDebt;
        user.amount = user.amount.add(_amount);
        uint256 newRewardDebt = user.amount.mul(pool.accSyxPerShare).div(1e12);
        user.rewardDebt = int256(newRewardDebt);
        if (prevAmount > 0) {
            int256 pending = int256(
                prevAmount.mul(pool.accSyxPerShare).div(1e12)
            ) - prevRewardDebt;
            uint256 syxBal = syx.balanceOf(address(this));
            if (pending > int256(syxBal)) {
                user.rewardDebt =
                    int256(newRewardDebt) -
                    pending +
                    int256(syxBal);
                syx.transfer(msg.sender, syxBal);
            } else {
                if (pending > 0) {
                    syx.transfer(msg.sender, uint256(pending));
                }
            }
        }
        pool.lpToken.safeTransferFrom(
            address(msg.sender),
            address(this),
            _amount
        );
        emit Deposit(msg.sender, _pid, _amount);
        return user.amount;
    }

    /**
     * Withdraw LP tokens from RewardManager.
     * @param _pid Reward pool Id
     * @param _amount Amount of LP tokens to withdraw
     * @return Total amount of the user's LP tokens
     */
    function withdraw(uint256 _pid, uint256 _amount)
        public
        validPool(_pid)
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "withdraw: not good");
        updatePool(_pid);
        int256 pending = int256(
            user.amount.mul(pool.accSyxPerShare).div(1e12)
        ) - user.rewardDebt;
        user.amount = user.amount.sub(_amount);

        uint256 syxBal = syx.balanceOf(address(this));
        uint256 newRewardDebt = user.amount.mul(pool.accSyxPerShare).div(1e12);
        if (pending > int256(syxBal)) {
            user.rewardDebt = int256(newRewardDebt) - pending + int256(syxBal);
            syx.transfer(msg.sender, syxBal);
        } else {
            user.rewardDebt = int256(newRewardDebt);
            if (pending > 0) {
                syx.transfer(msg.sender, uint256(pending));
            }
        }

        pool.lpToken.safeTransfer(address(msg.sender), _amount);
        emit Withdraw(msg.sender, _pid, _amount);
        return user.amount;
    }

    function getReward(uint256 _pid) public validPool(_pid) returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        int256 pending = int256(
            user.amount.mul(pool.accSyxPerShare).div(1e12)
        ) - user.rewardDebt;
        uint256 syxBal = syx.balanceOf(address(this));
        uint256 newRewardDebt = user.amount.mul(pool.accSyxPerShare).div(1e12);
        if (pending > int256(syxBal)) {
            user.rewardDebt = int256(newRewardDebt) - pending + int256(syxBal);
            syx.transfer(msg.sender, syxBal);
        } else {
            user.rewardDebt = int256(newRewardDebt);
            if (pending > 0) {
                syx.transfer(msg.sender, uint256(pending));
            }
        }
        if (pending > 0) {
            return uint256(pending);
        } else {
            return 0;
        }
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) public validPool(_pid) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        uint256 amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;
        pool.lpToken.safeTransfer(address(msg.sender), amount);
        emit EmergencyWithdraw(msg.sender, _pid, amount);
    }

    function emergencyWithdrawOverall(IERC20 token, address to)
        external
        onlyOwner
    {
        if (address(token) == address(0)) {
            to.transfer(address(this).balance);
        } else {
            token.safeTransfer(to, token.balanceOf(address(this)));
        }
    }

    /**
     * View functions
     */
    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    // Return reward multiplier over the given _from to _to block.
    function getMultiplier(uint256 _from, uint256 _to)
        public
        view
        returns (uint256)
    {
        uint256 _endBlock;
        uint256 _startBlock;

        // Ensure _from is not smaller than startBlock
        _from = _from > _startBlock ? _from : _startBlock;

        if (_to > endBlock) {
            _endBlock = endBlock;
        } else {
            _endBlock = _to;
        }

        if (_from > endBlock) {
            _startBlock = endBlock;
        } else {
            _startBlock = _from;
        }

        if (_endBlock <= bonusEndBlock) {
            return _endBlock.sub(_startBlock).mul(BONUS_MULTIPLIER);
        } else if (_startBlock >= bonusEndBlock) {
            return _endBlock.sub(_startBlock);
        } else {
            return
                bonusEndBlock.sub(_startBlock).mul(BONUS_MULTIPLIER).add(
                    _endBlock.sub(bonusEndBlock)
                );
        }
    }

    // View function to see pending syX on frontend.
    function pendingSyx(uint256 _pid, address _user)
        external
        view
        validPool(_pid)
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accSyxPerShare = pool.accSyxPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(
                pool.lastRewardBlock,
                block.number
            );
            uint256 syxReward = multiplier
                .mul(syxPerBlock)
                .mul(pool.allocPoint)
                .div(totalAllocPoint);
            accSyxPerShare = accSyxPerShare.add(
                syxReward.mul(1e12).div(lpSupply)
            );
        }
        if (
            int256(user.amount.mul(accSyxPerShare).div(1e12)) > user.rewardDebt
        ) {
            return
                uint256(
                    int256(user.amount.mul(accSyxPerShare).div(1e12)) -
                        user.rewardDebt
                );
        } else {
            return 0;
        }
    }

    /**
     * Internal functions
     */
    // Update dev address by the previous dev.
    function dev(address _devaddr) external {
        require(msg.sender == devaddr, "dev: wut?");
        devaddr = _devaddr;
    }

    function checkDuplicatePool(IERC20 _lpToken) internal view {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; pid++) {
            require(poolInfo[pid].lpToken != _lpToken, "add: pool duplicated");
        }
    }
}
