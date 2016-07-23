echo -e '\033[45;37m Prepare for packing source code in branch develop. \033[0m'
echo -e '\033[45;37m Please make sure current branch is develop and current working directory is clean. \033[0m'
echo -e '\033[45;37m Notice: this shell is only use for packing source, updating master and gh-pages branches. \033[0m'
read -p 'Are you sure and ready to pack ? (y or n) '

if [[ $REPLY =~ ^[Yy]$ ]]
	then
	# pack all files use each script (do not use `npm run pack`, will not add completely)
	echo -e '\033[33m Packing [sugar.js] start ... \033[0m'
	npm run pack-sugar
	git add -A
	echo -e '\033[32m Packed [sugar.js] success. \033[0m'
	echo -e '\n--------------------------------------------------\n'

	echo -e '\033[33m Packing [mvvm.js] start ... \033[0m'
	npm run pack-mvvm
	git add -A
	echo -e '\033[32m Packed [mvvm.js] success. \033[0m'
	echo -e '\n--------------------------------------------------\n'

	echo -e '\033[33m Packing [sugar.min.js] start ... \033[0m'
	npm run pack-sugar-min
	git add -A
	echo -e '\033[32m Packed [sugar.min.js] success. \033[0m'
	echo -e '\n--------------------------------------------------\n'

	echo -e '\033[33m Packing [mvvm.min.js] start ... \033[0m'
	npm run pack-mvvm-min
	git add -A
	echo -e '\033[32m Packed [mvvm.min.js] success. \033[0m'
	echo -e '\n--------------------------------------------------\n'


	# add commit
	git commit -m 'Bundle code ['`date '+%Y%m%d-%H:%M:%S'`']'


	# update master
	echo -e '\033[33m Updating master ... \033[0m'
	git checkout master
	git merge develop
	git push origin master
	echo -e '\033[32m Origin master is updated! \033[0m'
	echo -e '\n--------------------------------------------------\n'


	# update gh-pages
	echo -e '\033[33m Updating gh-pages ... \033[0m'
	git checkout gh-pages
	git merge master
	git commit -m 'Update gh-pages ['`date '+%Y%m%d-%H:%M:%S'`']'
	git push origin gh-pages
	echo -e '\033[32m Origin gh-pages is updated! \033[0m'
	echo -e '\n--------------------------------------------------\n'


	# back to develop
	git checkout develop
	echo -e '\033[42;37m All done! origin/master and origin/gh-pages is updated. \033[0m'
fi